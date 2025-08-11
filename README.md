# Crop Predictor - Fullstack

1. Put your sklearn model as `model/model.pkl`.
2. Start backend:
   cd server
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   export MODEL_PATH="../model/model.pkl"
   python app.py

3. Start frontend:
   cd client
   npm install
   npm start

Frontend will run at http://localhost:3000 and proxy API calls to http://localhost:5000/api/predict
