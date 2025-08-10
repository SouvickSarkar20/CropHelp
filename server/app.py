# server/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from model_loader import load_model, predict_from_model

app = Flask(__name__)
CORS(app)

# Load model once on startup
MODEL_PATH = os.environ.get("MODEL_PATH", "models\RandomForest.pkl")
model = load_model(MODEL_PATH)

# Reasonable input ranges - same as frontend
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
    for key, (mn, mx) in RANGES.items():
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


@app.route("/api/predict", methods=["POST"])
def predict():
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "Invalid JSON body"}), 400

    errors = validate_input(payload)
    if errors:
        return jsonify({"error": "validation", "details": errors}), 400

    try:
        label, confidence = predict_from_model(model, payload)
        return jsonify({"label": label, "confidence": confidence})
    except Exception as e:
        return jsonify({"error": "prediction_failed", "message": str(e)}), 500


if __name__ == "__main__":
    # flask run is preferred, but allow direct run for dev
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
