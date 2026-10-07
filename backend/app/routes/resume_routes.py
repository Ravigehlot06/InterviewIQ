import os
from flask import Blueprint, request, jsonify, current_app

from app.extensions import db
from app.models.resume import Resume
from app.middleware.auth_middleware import require_auth
from app.utils.errors import ApiError
from app.services import resume_service

resume_bp = Blueprint("resumes", __name__)


@resume_bp.post("")
@require_auth
def upload_resume():
    user = request.current_user
    if "file" not in request.files:
        raise ApiError("No file was uploaded.", 400, "validation_error")

    file = request.files["file"]
    if file.filename == "":
        raise ApiError("No file was selected.", 400, "validation_error")
    if not resume_service.allowed_file(file.filename):
        raise ApiError("Only PDF and DOCX resumes are supported.", 400, "unsupported_file_type")

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    original_filename, stored_filename, ext = resume_service.save_upload(file, upload_folder)
    filepath = os.path.join(upload_folder, stored_filename)

    try:
        raw_text = resume_service.extract_text(filepath, ext)
        parsed = resume_service.parse_resume_text(raw_text)
    except Exception:
        raise ApiError("Could not read this file. Please upload a valid PDF or DOCX resume.",
                        422, "resume_parse_failed")

    resume = Resume(
        user_id=user.id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_type=ext,
        raw_text=raw_text[:20000],
        parsed_name=parsed.get("name"),
        parsed_education=parsed.get("education"),
        parsed_skills=",".join(parsed.get("skills", [])),
        parsed_projects=parsed.get("projects"),
        parsed_experience=parsed.get("experience"),
        parsed_certifications=parsed.get("certifications"),
    )
    db.session.add(resume)
    db.session.commit()

    return jsonify(resume.to_dict()), 201


@resume_bp.get("")
@require_auth
def list_resumes():
    resumes = Resume.query.filter_by(user_id=request.current_user.id).order_by(Resume.created_at.desc()).all()
    return jsonify([r.to_dict() for r in resumes])


@resume_bp.delete("/<int:resume_id>")
@require_auth
def delete_resume(resume_id):
    resume = Resume.query.filter_by(id=resume_id, user_id=request.current_user.id).first()
    if not resume:
        raise ApiError("Resume not found.", 404, "not_found")
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    filepath = os.path.join(upload_folder, resume.stored_filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.session.delete(resume)
    db.session.commit()
    return jsonify({"message": "Resume deleted."})
