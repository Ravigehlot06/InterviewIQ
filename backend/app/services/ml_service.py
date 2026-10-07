"""
ml_service.py
-------------
Wrapper the Flask app uses to get an "Interview Readiness Estimate"
for a completed interview. Delegates inference to
backend/ml/predict.py so the ML pipeline stays independently runnable
and testable outside of Flask.
"""
import os
import logging

logger = logging.getLogger("interviewiq.ml")

_MODEL_PATH = os.getenv("ML_MODEL_PATH", "ml/models/readiness_model.joblib")


def get_readiness_estimate(features: dict) -> dict:
    """
    features: {
        technical_score, communication_score, problem_solving_score,
        confidence_score, answer_quality, questions_answered, overall_score,
        difficulty, experience_level, interview_type
    }
    Returns: {"readiness_label": str, "readiness_score": float, "confidence": float, "source": "ml"|"fallback"}
    """
    try:
        from ml.predict import predict_readiness
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(_MODEL_PATH)
        result = predict_readiness(features, model_path=_MODEL_PATH)
        if len(result) == 3:
            label, score, conf = result
        else:
            label, score = result
            conf = 100.0
        return {
            "readiness_label": label,
            "readiness_score": round(float(score), 1),
            "confidence": round(float(conf), 1),
            "source": "ml",
        }
    except Exception as exc:
        logger.warning("ML model unavailable (%s); using rule-based fallback readiness.", exc)
        return _fallback_readiness(features)


def _fallback_readiness(features: dict) -> dict:
    """Simple rule-based fallback used only if the trained model file is
    missing. Clearly marked as 'fallback'.
    """
    overall = float(features.get("overall_score", 0) or 0.0)
    if overall >= 80:
        label = "Interview Ready"
    elif overall >= 60:
        label = "Almost Ready"
    elif overall >= 40:
        label = "Needs Practice"
    else:
        label = "Early Stage"
    return {
        "readiness_label": label,
        "readiness_score": round(overall, 1),
        "confidence": 100.0,
        "source": "fallback",
    }
