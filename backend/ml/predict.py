"""
predict.py
----------
Loads the trained model artifact and produces an Interview Readiness
Estimate for a single set of interview features. Used by
app/services/ml_service.py; also runnable standalone for debugging.

Run from backend/:
    python ml/predict.py
"""
import os
import joblib
import pandas as pd

HERE = os.path.dirname(__file__)
DEFAULT_MODEL_PATH = os.path.join(HERE, "models", "readiness_model.joblib")

_cache = {}


def _load(model_path: str):
    if model_path not in _cache:
        _cache[model_path] = joblib.load(model_path)
    return _cache[model_path]


def predict_readiness(features: dict, model_path: str = DEFAULT_MODEL_PATH):
    """
    features keys: technical_score, communication_score, problem_solving_score,
    confidence_score, answer_quality, questions_answered, overall_score,
    difficulty, experience_level, interview_type

    Returns: (readiness_label: str, readiness_score: float 0-100, confidence: float 0-100)
    """
    artifact = _load(model_path)
    model = artifact["model"]
    encoders = artifact["encoders"]
    feature_cols = artifact["feature_cols"]

    row = {k: float(features.get(k, 0) or 0) for k in [
        "technical_score", "communication_score", "problem_solving_score",
        "confidence_score", "answer_quality", "questions_answered", "overall_score",
    ]}
    for cat_col in ["difficulty", "experience_level", "interview_type"]:
        le = encoders[cat_col]
        value = features.get(
            cat_col,
            "medium" if cat_col == "difficulty" else ("fresher" if cat_col == "experience_level" else "technical")
        )
        if value not in le.classes_:
            # Unseen category (e.g. new interview_type) - use the most common class.
            value = le.classes_[0]
        row[cat_col] = le.transform([value])[0]

    X = pd.DataFrame([row])[feature_cols]
    proba = model.predict_proba(X)[0]
    pred_idx = proba.argmax()

    label_encoder = encoders["readiness_label"]
    label = str(label_encoder.inverse_transform([pred_idx])[0])
    confidence = float(proba[pred_idx]) * 100

    # Calculate continuous interview readiness score (0-100%)
    raw_overall = float(features.get("overall_score") or 0.0)
    if raw_overall == 0:
        tech = float(features.get("technical_score") or 0.0)
        comm = float(features.get("communication_score") or 0.0)
        prob_s = float(features.get("problem_solving_score") or 0.0)
        ans_q = float(features.get("answer_quality") or 0.0)
        raw_overall = 0.35 * tech + 0.25 * comm + 0.25 * prob_s + 0.15 * ans_q

    diff = str(features.get("difficulty", "medium")).lower()
    diff_adj = {"easy": -2.0, "medium": 0.0, "hard": 4.0}.get(diff, 0.0)

    answered = int(features.get("questions_answered", 6) or 6)
    completion_factor = min(1.0, max(0.4, answered / 6.0)) if answered < 4 else 1.0

    readiness_score = (raw_overall + diff_adj) * completion_factor
    readiness_score = max(0.0, min(100.0, readiness_score))

    # Sanity alignment: prevent model outliers from mismatching overall score
    if raw_overall < 40.0 and label in ["Almost Ready", "Interview Ready"]:
        label = "Early Stage" if raw_overall < 35.0 else "Needs Practice"
    elif raw_overall >= 80.0 and label in ["Early Stage", "Needs Practice"]:
        label = "Interview Ready"
    elif raw_overall >= 60.0 and label == "Early Stage":
        label = "Needs Practice" if raw_overall < 65.0 else "Almost Ready"

    # Keep readiness_score aligned with the predicted readiness_label boundaries:
    # Early Stage: < 40, Needs Practice: 40-59.9, Almost Ready: 60-79.9, Interview Ready: >= 80
    if label == "Early Stage":
        readiness_score = min(39.9, readiness_score)
    elif label == "Needs Practice":
        readiness_score = max(40.0, min(59.9, readiness_score))
    elif label == "Almost Ready":
        readiness_score = max(60.0, min(79.9, readiness_score))
    elif label == "Interview Ready":
        readiness_score = max(80.0, min(100.0, readiness_score))

    return label, round(readiness_score, 1), round(confidence, 1)


if __name__ == "__main__":
    demo_features = {
        "technical_score": 78, "communication_score": 82, "problem_solving_score": 70,
        "confidence_score": 75, "answer_quality": 80, "questions_answered": 6,
        "overall_score": 77, "difficulty": "medium", "experience_level": "0-2",
        "interview_type": "technical",
    }
    label, score, conf = predict_readiness(demo_features)
    print(f"Readiness: {label} ({score}% readiness score, {conf}% model confidence)")
