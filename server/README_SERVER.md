# Server

1. Create a virtualenv and install:
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

2. Ensure model is at ../model/model.pkl or set MODEL_PATH environment variable.

3. Start:
   export MODEL_PATH="../model/model.pkl"
   flask run --host=0.0.0.0 --port=5000
   OR
   python app.py
