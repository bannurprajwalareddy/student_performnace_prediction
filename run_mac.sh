#!/bin/bash
# One-command start for macOS. Usage: bash run_mac.sh
cd "$(dirname "$0")/backend" || exit 1
[ -d venv ] || python3 -m venv venv
source venv/bin/activate
pip install -q -r requirements.txt
[ -f model.joblib ] || python train_model.py
(cd ../student-performance-frontend && python3 -m http.server 8000 >/dev/null 2>&1 &)
sleep 1; open http://localhost:8000
echo "Frontend: http://localhost:8000   API: http://localhost:5001   (Ctrl+C stops the API)"
python app.py
