"""
interview_routes.py
--------------------
The core interview engine. Generates one question at a time, evaluates
each answer, decides whether the next question is a follow-up or a new
topic, and finalizes the interview with aggregated feedback + ML
readiness estimate.
"""
from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.interview import Interview
from app.models.interview_question import InterviewQuestion
from app.models.response import Response
from app.models.evaluation import Evaluation
from app.models.report import Report
from app.models.performance_metric import PerformanceMetric
from app.models.role import Role
from app.models.company import Company
from app.models.resume import Resume
from app.middleware.auth_middleware import require_auth
from app.utils.errors import ApiError
from app.schemas.validators import require_fields
from app.services import gemini_service, resume_service
from app.services.ml_service import get_readiness_estimate

interview_bp = Blueprint("interviews", __name__)

VALID_EXPERIENCE = {"fresher", "0-2", "2-5", "5+"}
VALID_DIFFICULTY = {"easy", "medium", "hard"}
VALID_TYPES = {"hr", "technical", "role_based", "company"}


def _owned_interview(interview_id, user_id, include_questions=False):
    interview = Interview.query.filter_by(id=interview_id, user_id=user_id).first()
    if not interview:
        raise ApiError("Interview not found.", 404, "not_found")
    return interview


def _build_context(interview: Interview, last_question=None, last_answer=None):
    resume_summary = ""
    if interview.resume_id:
        resume = Resume.query.get(interview.resume_id)
        if resume:
            resume_summary = resume_service.build_resume_summary({
                "skills": resume.parsed_skills.split(",") if resume.parsed_skills else [],
                "experience": resume.parsed_experience,
                "projects": resume.parsed_projects,
            })
    previous_questions = [q.question_text for q in interview.questions]
    return {
        "role_name": interview.role.name if interview.role else "the role",
        "company_name": interview.company.name if interview.company else None,
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "resume_summary": resume_summary,
        "previous_questions": previous_questions,
        "last_question": last_question,
        "last_answer": last_answer,
    }


@interview_bp.post("")
@require_auth
def create_interview():
    user = request.current_user
    data = request.get_json(silent=True) or {}
    require_fields(data, ["role_id", "experience_level", "difficulty", "interview_type"])

    if data["experience_level"] not in VALID_EXPERIENCE:
        raise ApiError("Invalid experience_level.", 400, "validation_error")
    if data["difficulty"] not in VALID_DIFFICULTY:
        raise ApiError("Invalid difficulty.", 400, "validation_error")
    if data["interview_type"] not in VALID_TYPES:
        raise ApiError("Invalid interview_type.", 400, "validation_error")

    role = Role.query.get(data["role_id"])
    if not role:
        raise ApiError("Selected role does not exist.", 404, "not_found")

    company = None
    if data.get("company_id"):
        company = Company.query.get(data["company_id"])
        if not company:
            raise ApiError("Selected company does not exist.", 404, "not_found")

    resume = None
    if data.get("resume_id"):
        resume = Resume.query.filter_by(id=data["resume_id"], user_id=user.id).first()
        if not resume:
            raise ApiError("Selected resume does not exist.", 404, "not_found")

    interview = Interview(
        user_id=user.id,
        role_id=role.id,
        company_id=company.id if company else None,
        resume_id=resume.id if resume else None,
        experience_level=data["experience_level"],
        difficulty=data["difficulty"],
        interview_type=data["interview_type"],
        planned_questions=int(data.get("planned_questions", 6)),
    )
    db.session.add(interview)
    db.session.flush()

    context = _build_context(interview)
    generated = gemini_service.generate_interview_question(context)

    question = InterviewQuestion(
        interview_id=interview.id,
        sequence=1,
        question_text=generated["question"],
        question_type=generated.get("question_type", interview.interview_type),
        is_follow_up=False,
    )
    db.session.add(question)
    db.session.commit()

    return jsonify({
        "interview": interview.to_dict(),
        "current_question": question.to_dict(),
        "ai_source": generated.get("source", "demo"),
    }), 201


@interview_bp.get("")
@require_auth
def list_interviews():
    interviews = (
        Interview.query.filter_by(user_id=request.current_user.id)
        .order_by(Interview.started_at.desc())
        .all()
    )
    return jsonify([i.to_dict() for i in interviews])


@interview_bp.get("/<interview_id>")
@require_auth
def get_interview(interview_id):
    interview = _owned_interview(interview_id, request.current_user.id)
    return jsonify(interview.to_dict(include_questions=True))


@interview_bp.post("/<interview_id>/answer")
@require_auth
def submit_answer(interview_id):
    interview = _owned_interview(interview_id, request.current_user.id)
    if interview.status != "in_progress":
        raise ApiError("This interview has already ended.", 409, "interview_not_active")

    data = request.get_json(silent=True) or {}
    require_fields(data, ["question_id", "answer_text"])

    question = InterviewQuestion.query.filter_by(
        id=data["question_id"], interview_id=interview.id
    ).first()
    if not question:
        raise ApiError("Question not found.", 404, "not_found")
    if question.response:
        raise ApiError("This question has already been answered.", 409, "already_answered")

    response = Response(question_id=question.id, answer_text=data["answer_text"])
    db.session.add(response)
    db.session.flush()

    eval_result = gemini_service.evaluate_answer({
        "question": question.question_text,
        "answer": data["answer_text"],
    })
    evaluation = Evaluation(
        response_id=response.id,
        technical_score=eval_result.get("technical_score"),
        communication_score=eval_result.get("communication_score"),
        problem_solving_score=eval_result.get("problem_solving_score"),
        relevance_score=eval_result.get("relevance_score"),
        confidence_score=eval_result.get("confidence_score"),
        feedback=eval_result.get("feedback"),
        key_points_detected=",".join(eval_result.get("key_points", [])),
        source=eval_result.get("source", "demo"),
    )
    db.session.add(evaluation)
    db.session.commit()

    return jsonify({"response": response.to_dict()})


@interview_bp.post("/<interview_id>/next-question")
@require_auth
def next_question(interview_id):
    interview = _owned_interview(interview_id, request.current_user.id)
    if interview.status != "in_progress":
        raise ApiError("This interview has already ended.", 409, "interview_not_active")

    answered = [q for q in interview.questions if q.response]
    if len(answered) >= interview.planned_questions:
        raise ApiError(
            "All planned questions have been answered. Complete the interview instead.",
            409, "interview_complete_pending",
        )

    last_question_obj = answered[-1] if answered else None
    last_question = last_question_obj.question_text if last_question_obj else None
    last_answer = last_question_obj.response.answer_text if last_question_obj else None

    context = _build_context(interview, last_question, last_answer)

    # Alternate: follow up on the most recent answer, then move to a new topic.
    use_follow_up = bool(last_question_obj) and not last_question_obj.is_follow_up
    if use_follow_up:
        generated = gemini_service.generate_follow_up_question(context)
        is_follow_up = True
        parent_id = last_question_obj.id
    else:
        generated = gemini_service.generate_interview_question(context)
        is_follow_up = False
        parent_id = None

    next_seq = len(interview.questions) + 1
    question = InterviewQuestion(
        interview_id=interview.id,
        sequence=next_seq,
        question_text=generated["question"],
        question_type=generated.get("question_type", "follow_up" if is_follow_up else interview.interview_type),
        is_follow_up=is_follow_up,
        parent_question_id=parent_id,
    )
    db.session.add(question)
    db.session.commit()

    return jsonify({
        "current_question": question.to_dict(),
        "ai_source": generated.get("source", "demo"),
        "questions_answered": len(answered),
        "planned_questions": interview.planned_questions,
    })


@interview_bp.post("/<interview_id>/complete")
@require_auth
def complete_interview(interview_id):
    from datetime import datetime, timezone

    interview = _owned_interview(interview_id, request.current_user.id)
    if interview.status == "completed":
        raise ApiError("This interview is already completed.", 409, "already_completed")

    answered_questions = [q for q in interview.questions if q.response and q.response.evaluation]
    evaluations = [q.response.evaluation.to_dict() for q in answered_questions]

    def avg(key):
        vals = [e.get(key) for e in evaluations if e.get(key) is not None]
        return round(sum(vals) / len(vals), 1) if vals else 0.0

    technical = avg("technical_score")
    communication = avg("communication_score")
    problem_solving = avg("problem_solving_score")
    relevance = avg("relevance_score")
    confidence = avg("confidence_score")
    overall = round((technical + communication + problem_solving + relevance) / 4, 1) if evaluations else 0.0

    final_feedback = gemini_service.generate_final_feedback({
        "evaluations": evaluations,
        "role_name": interview.role.name if interview.role else "the role",
    })

    ml_features = {
        "technical_score": technical,
        "communication_score": communication,
        "problem_solving_score": problem_solving,
        "confidence_score": confidence,
        "answer_quality": relevance,
        "questions_answered": len(answered_questions),
        "overall_score": overall,
        "difficulty": interview.difficulty,
        "experience_level": interview.experience_level,
        "interview_type": interview.interview_type,
    }
    readiness = get_readiness_estimate(ml_features)

    report = Report(
        interview_id=interview.id,
        overall_score=overall,
        technical_score=technical,
        communication_score=communication,
        problem_solving_score=problem_solving,
        answer_quality_score=relevance,
        strengths=",".join(final_feedback.get("strengths", [])),
        areas_to_improve=",".join(final_feedback.get("areas_to_improve", [])),
        ai_feedback_summary=final_feedback.get("ai_feedback_summary"),
        recommended_practice_areas=",".join(final_feedback.get("recommended_practice_areas", [])),
        readiness_label=readiness["readiness_label"],
        readiness_score=readiness["readiness_score"],
        readiness_source=readiness["source"],
        suggested_next_interview=(
            f"{interview.role.name} - {interview.difficulty} difficulty" if interview.role else None
        ),
    )
    db.session.add(report)

    metric = PerformanceMetric(
        user_id=interview.user_id,
        interview_id=interview.id,
        technical_score=technical,
        communication_score=communication,
        problem_solving_score=problem_solving,
        confidence_score=confidence,
        answer_quality=relevance,
        questions_answered=len(answered_questions),
        overall_score=overall,
        difficulty=interview.difficulty,
        experience_level=interview.experience_level,
        interview_type=interview.interview_type,
        readiness_label=readiness["readiness_label"],
    )
    db.session.add(metric)

    interview.status = "completed"
    interview.completed_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({"interview": interview.to_dict(), "report": report.to_dict()})
