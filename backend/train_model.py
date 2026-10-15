"""Train the prediction model.  python train_model.py            -> synthetic PLACEHOLDER data
                                python train_model.py data.csv   -> your real dataset
CSV columns required: att,internal,prev,assign,gpa,study,score   (score = final result 0-100)"""
import sys, numpy as np, pandas as pd, joblib  # pandas is installed with scikit-learn extras: pip install pandas
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
F = ['att', 'internal', 'prev', 'assign', 'gpa', 'study']
if len(sys.argv) > 1:
    df, source = pd.read_csv(sys.argv[1]), 'trained on ' + sys.argv[1]
else:  # synthetic data only so the pipeline works end-to-end; NOT real student data
    r = np.random.default_rng(1); n = 3000
    df = pd.DataFrame({'att': r.uniform(40, 100, n), 'internal': r.uniform(30, 100, n), 'prev': r.uniform(30, 100, n),
                       'assign': r.uniform(30, 100, n), 'gpa': r.uniform(4, 10, n), 'study': r.uniform(0, 10, n)})
    df['score'] = (.25*df.att + .2*df.internal + .25*df.prev + .1*df.assign + df.gpa + df.study.clip(upper=6)*1.5 + r.normal(0, 3, n)).clip(0, 100)
    source = 'trained on synthetic placeholder data'
Xtr, Xte, ytr, yte = train_test_split(df[F], df['score'], test_size=.2, random_state=1)
m = RandomForestRegressor(200, random_state=1).fit(Xtr, ytr)
print('R2 on held-out data:', round(r2_score(yte, m.predict(Xte)), 3))
joblib.dump({'model': m, 'source': source}, 'model.joblib'); print('Saved model.joblib (' + source + ')')
