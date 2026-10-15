# Backend (Flask + SQLite)
    cd backend
    python3 -m venv venv && source venv/bin/activate
    pip install -r requirements.txt
    python train_model.py            # synthetic placeholder model; or: python train_model.py yourdata.csv
    python app.py                    # API on http://localhost:5001
Then open ../student-performance-frontend/index.html. Demo logins: student@demo.test, faculty@demo.test, admin@demo.test (password demo123).
