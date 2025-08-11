# server/model_loader.py
import pickle
import numpy as np

def load_model(path):
    with open(path, "rb") as f:
        model = pickle.load(f)
    return model

def predict_from_model(model, payload):
    """
    payload: dict with keys N,P,K,temperature,humidity,ph,rainfall
    Returns (label, confidence)
    """
    # Maintain column order same as used during training
    X = [
        float(payload["N"]),
        float(payload["P"]),
        float(payload["K"]),
        float(payload["temperature"]),
        float(payload["humidity"]),
        float(payload["ph"]),
        float(payload["rainfall"]),
    ]
    arr = np.array(X).reshape(1, -1)
    # model.predict and model.predict_proba are expected for sklearn RandomForestClassifier
    label = model.predict(arr)[0]
    confidence = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(arr)[0]
        # choose probability of predicted class
        pred_idx = list(model.classes_).index(label)
        confidence = float(probs[pred_idx])
    else:
        confidence = 1.0
    return str(label), float(confidence)
