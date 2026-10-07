from flask import Blueprint, request, jsonify

from app.models.interview import Interview
from app.models.report import Report
from app.middleware.auth_middleware import require_auth
from app.utils.errors import ApiError

report_bp = Blueprint("reports", __name__)


@report_bp.get("/<interview_id>")
@require_auth
def get_report(interview_id):
    interview = Interview.query.filter_by(id=interview_id, user_id=request.current_user.id).first()
    if not interview:
        raise ApiError("Interview not found.", 404, "not_found")
    if not interview.report:
        raise ApiError("This interview has not been completed yet.", 404, "report_not_ready")

    data = interview.report.to_dict()
    data["interview"] = interview.to_dict(include_questions=True)
    return jsonify(data)
