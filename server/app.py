from flask import Flask,request,jsonify
from flask_cors import CORS
import os 
#from model_loader import load_mmodel,predict_from_model

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.environ.get("MODEL_PATH","../model/model.pkl")
#model = load_model(MODEL_PATH)

RANGES = {
    "N": (0, 3000),
    "P": (0, 3000),
    "K": (0, 3000),
    "temperature": (-10, 60),
    "humidity": (0, 100),
    "ph": (0, 14),
    "rainfall": (0, 500),
}

def validate_input(data):
    errors = {}
    for key , (mn,mx) in RANGES.items():
        if key not in data:
            errors[key] = "Missing"
            continue
        try:
            val = float(data[key])
        except Exception:
            errors[key] = "Must be numeric"
            continue
        if val < mn or val > mx:
            errors[key] = f"Must be between {mn} and {mx}"
    return errors

