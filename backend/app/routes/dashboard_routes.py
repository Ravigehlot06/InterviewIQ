from flask import Blueprint, request, jsonify

from app.models.interview import Interview
from app.middleware.auth_middleware import require_auth

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/dashboard")
@require_auth
def dashboard():
    user = request.current_user
    interviews = Interview.query.filter_by(user_id=user.id).order_by(Interview.started_at.desc()).all()
    completed = [i for i in interviews if i.status == "completed" and i.report]

    interview_count = len(interviews)
    average_score = round(sum(i.report.overall_score for i in completed) / len(completed), 1) if completed else 0
    latest_readiness = completed[0].report.readiness_label if completed else None

    role_performance = {}
    for i in completed:
        role_name = i.role.name if i.role else "Unknown"
        role_performance.setdefault(role_name, []).append(i.report.overall_score)
    role_performance = {
        role: round(sum(scores) / len(scores), 1) for role, scores in role_performance.items()
    }

    recent_improvement = None
    if len(completed) >= 2:
        recent_improvement = round(completed[0].report.overall_score - completed[1].report.overall_score, 1)

    latest_report = completed[0].report if completed else None
    readiness_score = 0
    if latest_report:
        r_score = latest_report.readiness_score
        # Guard against legacy stored classifier confidence (e.g. 98-100% on Early Stage / Needs Practice)
        if r_score is not None:
            if latest_report.readiness_label == "Early Stage" and r_score >= 60:
                r_score = min(39.9, latest_report.overall_score)
            elif latest_report.readiness_label == "Needs Practice" and (r_score >= 80 or r_score < 40):
                r_score = max(40.0, min(59.9, latest_report.overall_score))
            readiness_score = round(float(r_score), 1)
        else:
            readiness_score = round(float(latest_report.overall_score), 1)

    # Calculate practice streak in days
    streak_days = 0
    if interviews:
        practice_dates = sorted({i.started_at.date() for i in interviews if i.started_at}, reverse=True)
        from datetime import date, timedelta
        current_check = date.today()
        # allow streak to count from today or yesterday
        if practice_dates and (practice_dates[0] == current_check or practice_dates[0] == current_check - timedelta(days=1)):
            check_date = practice_dates[0]
            for pdate in practice_dates:
                if pdate == check_date:
                    streak_days += 1
                    check_date -= timedelta(days=1)
                else:
                    break
        else:
            streak_days = 1 if practice_dates else 0

    # Interview type breakdown
    type_counts = {}
    for i in interviews:
        t = i.interview_type or "technical"
        type_counts[t] = type_counts.get(t, 0) + 1
    total_types = sum(type_counts.values()) or 1
    type_breakdown = [
        {
            "type": t,
            "label": {"hr": "HR Practice", "technical": "Technical", "role_based": "Role-Based", "company": "Company Practice"}.get(t, t.title()),
            "count": count,
            "percentage": round((count / total_types) * 100)
        }
        for t, count in type_counts.items()
    ]

    # Performance trend over time
    performance_trend = []
    for iv in reversed(completed[:7]):
        rep = iv.report
        performance_trend.append({
            "id": iv.id,
            "date": iv.started_at.strftime("%b %d") if iv.started_at else "Session",
            "overall": round(rep.overall_score, 1),
            "technical": round(rep.technical_score, 1) if rep.technical_score is not None else round(rep.overall_score, 1),
            "communication": round(rep.communication_score, 1) if rep.communication_score is not None else round(rep.overall_score, 1),
            "problem_solving": round(rep.problem_solving_score, 1) if rep.problem_solving_score is not None else round(rep.overall_score, 1),
            "confidence": round(rep.answer_quality_score, 1) if rep.answer_quality_score is not None else round(rep.overall_score, 1),
            "role": iv.role.name if iv.role else "General",
        })

    # Recommended next step
    recommendation = {
        "title": "Practice Technical Interview",
        "reason": "Complete a 6-question mock interview to build your readiness score.",
        "action_label": "Start Practice",
        "action_type": "technical"
    }
    if latest_report:
        tech = latest_report.technical_score or latest_report.overall_score
        comm = latest_report.communication_score or latest_report.overall_score
        prob = latest_report.problem_solving_score or latest_report.overall_score
        if tech < comm and (comm - tech) >= 5:
            diff = round(comm - tech)
            recommendation = {
                "title": "Sharpen Technical Responses",
                "reason": f"Your technical performance is {diff}% lower than communication.",
                "action_label": "Practice Technical",
                "action_type": "technical"
            }
        elif prob < tech and (tech - prob) >= 5:
            diff = round(tech - prob)
            recommendation = {
                "title": "Elevate Problem Solving",
                "reason": f"Your problem-solving score is {diff}% below technical.",
                "action_label": "Practice Problem Solving",
                "action_type": "role_based"
            }
        elif latest_report.suggested_next_interview:
            recommendation = {
                "title": latest_report.suggested_next_interview,
                "reason": "AI recommendation based on your most recent performance feedback.",
                "action_label": "Start Next Session",
                "action_type": "role_based"
            }

    return jsonify({
        "welcome_name": user.full_name,
        "interview_count": interview_count,
        "average_score": average_score,
        "latest_readiness": latest_readiness,
        "readiness_score": readiness_score,
        "readiness_source": latest_report.readiness_source if latest_report else "ml",
        "streak_days": streak_days,
        "type_breakdown": type_breakdown,
        "performance_trend": performance_trend,
        "recommendation": recommendation,
        "role_performance": role_performance,
        "recent_improvement": recent_improvement,
        "recent_interviews": [i.to_dict() for i in interviews[:5]],
    })


@dashboard_bp.get("/history")
@require_auth
def history():
    user = request.current_user
    interviews = Interview.query.filter_by(user_id=user.id).order_by(Interview.started_at.desc()).all()
    result = []
    for i in interviews:
        item = i.to_dict()
        item["score"] = i.report.overall_score if i.report else None
        item["readiness"] = i.report.readiness_label if i.report else None
        result.append(item)
    return jsonify(result)
