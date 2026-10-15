"""Flask API for the Student Performance Prediction System.  Run: python app.py  (http://localhost:5001)"""
import os, sqlite3
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

BASE = os.path.dirname(os.path.abspath(__file__)); DB = os.path.join(BASE, 'spps.db')
app = Flask(__name__)
SECRET = os.environ.get('SECRET_KEY', 'dev-only-change-me')  # set SECRET_KEY in real use
ser = URLSafeTimedSerializer(SECRET)
FEATURES = {'att': (0, 100), 'internal': (0, 100), 'prev': (0, 100), 'assign': (0, 100), 'gpa': (0, 10), 'study': (0, 16)}

# ---------- model ----------
MODEL, SOURCE = None, ''
try:
    import joblib
    b = joblib.load(os.path.join(BASE, 'model.joblib')); MODEL, SOURCE = b['model'], b['source']
except Exception:
    pass

def formula(d):
    return min(100, .25*d['att'] + .2*d['internal'] + .25*d['prev'] + .1*d['assign'] + d['gpa'] + min(d['study'], 6)*1.5)

def predict(d):
    if MODEL is not None:
        score = float(MODEL.predict([[d[f] for f in FEATURES]])[0])
        note = f'Prediction from the backend ML model ({SOURCE}). Educational estimate only.'
    else:
        score = formula(d); note = 'No trained model found (run train_model.py). This is a fallback formula, not machine learning.'
    score = round(max(0, min(100, score)), 1)
    cat = 'High' if score >= 75 else 'Average' if score >= 60 else 'At Risk'
    ind = [d['att'], d['internal'], d['prev'], d['assign'], d['gpa']*10, min(d['study'], 6)/6*100]
    return {'score': score, 'category': cat, 'indicators': [round(x) for x in ind], 'note': note}

# ---------- database ----------
def db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB); g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close(_):
    x = g.pop('db', None)
    if x: x.close()

def init_db():
    c = sqlite3.connect(DB)
    c.executescript("""CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT,email TEXT UNIQUE,pw_hash TEXT,role TEXT,dept TEXT,sem INTEGER,status TEXT DEFAULT 'Active');
    CREATE TABLE IF NOT EXISTS predictions(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,date TEXT,att REAL,internal REAL,prev REAL,assign REAL,gpa REAL,study REAL,score REAL,category TEXT);""")
    if c.execute('SELECT COUNT(*) FROM users').fetchone()[0] == 0:
        pw = generate_password_hash('demo123')  # demo accounts: *@demo.test / demo123
        names = ['Aarav Mehta','Diya Nair','Rohan Das','Sneha Iyer','Kabir Shah','Meera Rao','Vikram Singh','Ananya Das','Ishaan Roy','Tara Menon','Arjun Patel','Nisha Verma','Dev Kapoor','Riya Jain','Karan Bose']
        depts = ['CSE-DS','CSE','IT','ECE']
        c.executemany('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)', [
            ('S-1001','Demo Student','student@demo.test',pw,'student','CSE-DS',5,'Active'),
            ('F-501','Demo Faculty','faculty@demo.test',pw,'faculty','CSE-DS',None,'Active'),
            ('F-500','Dr. Rao','faculty0@demo.test',pw,'faculty','CSE',None,'Active'),
            ('F-502','Dr. Khan','faculty2@demo.test',pw,'faculty','IT',None,'Inactive'),
            ('A-001','Demo Admin','admin@demo.test',pw,'admin',None,None,'Active')])
        def add(uid, d, when):
            p = predict(d)
            c.execute('INSERT INTO predictions(user_id,date,att,internal,prev,assign,gpa,study,score,category) VALUES(?,?,?,?,?,?,?,?,?,?)',
                      (uid, when, *[d[f] for f in FEATURES], p['score'], p['category']))
        for i, n in enumerate(names):
            c.execute('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)', (f'S-{2001+i}', n, n.split()[0].lower()+'@demo.test', pw, 'student', depts[i%4], 3+i%4, 'Active'))
            add(f'S-{2001+i}', dict(att=58+(i*7)%40, internal=45+(i*11)%50, prev=48+(i*13)%47, assign=50+(i*9)%50, gpa=round(5.5+(i*3)%35/10, 1), study=1+(i*2)%6), '2026-09-01 10:00')
        for i in range(6):
            add('S-1001', dict(att=70+i*4, internal=60+i*5, prev=62+i*3, assign=65+i*5, gpa=round(7+i*.2, 1), study=2+i%4), f'2026-0{4+i}-1{i} 10:3{i}')
    c.commit(); c.close()

# ---------- helpers ----------
@app.after_request
def cors(r):  # development CORS; restrict the origin in production
    r.headers['Access-Control-Allow-Origin'] = os.environ.get('ALLOWED_ORIGIN', '*')
    r.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    r.headers['Access-Control-Allow-Methods'] = 'GET,POST,PATCH,OPTIONS'
    return r

def auth(*roles):
    def deco(f):
        @wraps(f)
        def w(*a, **k):
            try:
                uid = ser.loads(request.headers.get('Authorization', '').replace('Bearer ', ''), max_age=86400)
            except (BadSignature, SignatureExpired):
                return jsonify(error='Please log in again.'), 401
            u = db().execute('SELECT * FROM users WHERE id=?', (uid,)).fetchone()
            if not u or u['status'] != 'Active': return jsonify(error='Account missing or inactive.'), 403
            if roles and u['role'] not in roles: return jsonify(error='Not allowed for your role.'), 403
            g.user = u
            return f(*a, **k)
        return w
    return deco

def public(u): return {k: u[k] for k in ('id', 'name', 'email', 'role', 'dept', 'sem')}
def session_for(u): return {'token': ser.dumps(u['id']), 'user': public(u)}

# ---------- routes ----------
@app.post('/api/auth/register')
def register():
    d = request.get_json(silent=True) or {}
    need = ['name', 'sid', 'email', 'dept', 'sem', 'password']
    if any(not str(d.get(k, '')).strip() for k in need): return jsonify(error='All fields are required.'), 400
    if len(d['password']) < 6: return jsonify(error='Password must be at least 6 characters.'), 400
    if db().execute('SELECT 1 FROM users WHERE email=? OR id=?', (d['email'].lower(), d['sid'])).fetchone():
        return jsonify(error='Email or Student ID already registered.'), 409
    db().execute('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)', (d['sid'], d['name'], d['email'].lower(), generate_password_hash(d['password']), 'student', d['dept'], int(d['sem']), 'Active'))
    db().commit()
    return jsonify(session_for(db().execute('SELECT * FROM users WHERE id=?', (d['sid'],)).fetchone())), 201

@app.post('/api/auth/login')
def login():
    d = request.get_json(silent=True) or {}
    u = db().execute('SELECT * FROM users WHERE email=?', (str(d.get('email', '')).lower(),)).fetchone()
    if not u or not check_password_hash(u['pw_hash'], d.get('password', '')): return jsonify(error='Incorrect email or password.'), 401
    if u['status'] != 'Active': return jsonify(error='This account is deactivated.'), 403
    return jsonify(session_for(u))

@app.post('/api/predict')
@auth('student')
def make_prediction():
    d = request.get_json(silent=True) or {}
    try:
        x = {f: float(d[f]) for f in FEATURES}
    except (KeyError, TypeError, ValueError):
        return jsonify(error='Missing or non-numeric fields.'), 400
    for f, (lo, hi) in FEATURES.items():
        if not lo <= x[f] <= hi: return jsonify(error=f'{f} must be between {lo} and {hi}.'), 400
    p = predict(x)
    db().execute('INSERT INTO predictions(user_id,date,att,internal,prev,assign,gpa,study,score,category) VALUES(?,?,?,?,?,?,?,?,?,?)',
                 (g.user['id'], datetime.now().strftime('%Y-%m-%d %H:%M'), *[x[f] for f in FEATURES], p['score'], p['category']))
    db().commit()
    return jsonify(p)

@app.get('/api/predictions')
@auth()
def predictions():
    q, a = 'SELECT * FROM predictions', ()
    if g.user['role'] == 'student': q, a = q + ' WHERE user_id=?', (g.user['id'],)
    rows = db().execute(q + ' ORDER BY date DESC, id DESC', a).fetchall()
    return jsonify([{**{k: r[k] for k in ('date', 'att', 'internal', 'prev', 'assign', 'gpa', 'study', 'score', 'category')}, 'id': r['id']} for r in rows])

@app.get('/api/students')
@auth('faculty', 'admin')
def students():
    rows = db().execute("""SELECT u.id,u.name,u.dept,u.sem,p.att,p.internal,p.prev,p.assign,p.gpa,p.study,p.score,p.category
        FROM users u JOIN predictions p ON p.id=(SELECT MAX(id) FROM predictions WHERE user_id=u.id) WHERE u.role='student' ORDER BY u.id""").fetchall()
    return jsonify([dict(r) for r in rows])

@app.get('/api/users')
@auth('admin')
def users():
    return jsonify([{k: r[k] for k in ('id', 'name', 'email', 'role', 'status')} for r in db().execute('SELECT * FROM users ORDER BY role,id')])

@app.patch('/api/users/<uid>')
@auth('admin')
def edit_user(uid):
    d = request.get_json(silent=True) or {}
    if uid == g.user['id'] and d.get('status') == 'Inactive': return jsonify(error='You cannot deactivate yourself.'), 400
    for k in ('name', 'email', 'status'):
        if k in d:
            if k == 'status' and d[k] not in ('Active', 'Inactive'): return jsonify(error='Invalid status.'), 400
            db().execute(f'UPDATE users SET {k}=? WHERE id=?', (d[k], uid))
    db().commit()
    return jsonify(ok=True)

init_db()

if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0", port=5001)
