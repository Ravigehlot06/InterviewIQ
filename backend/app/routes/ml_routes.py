from flask import Blueprint, request, jsonify

from app.middleware.auth_middleware import require_auth
from app.schemas.validators import require_fields
from app.services.ml_service import get_readiness_estimate

ml_bp = Blueprint("ml", __name__)


@ml_bp.post("/predict")
@require_auth
def predict():
    """Standalone readiness prediction endpoint (used by the report page
    to re-fetch/recompute, and useful for manual API testing/demos)."""
    data = request.get_json(silent=True) or {}
    require_fields(data, [
        "technical_score", "communication_score", "problem_solving_score",
        "confidence_score", "answer_quality", "questions_answered",
        "overall_score", "difficulty", "experience_level", "interview_type",
    ])
    result = get_readiness_estimate(data)
    return jsonify(result)
