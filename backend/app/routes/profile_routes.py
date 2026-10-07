from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.profile import Profile
from app.middleware.auth_middleware import require_auth

profile_bp = Blueprint("profile", __name__)


@profile_bp.get("")
@require_auth
def get_profile():
    user = request.current_user
    if not user.profile:
        return jsonify({"education": None, "experience_level": None, "skills": [],
                         "preferred_roles": [], "bio": None})
    return jsonify(user.profile.to_dict())


@profile_bp.put("")
@require_auth
def update_profile():
    user = request.current_user
    data = request.get_json(silent=True) or {}

    profile = user.profile or Profile(user_id=user.id)
    if "education" in data:
        profile.education = data["education"]
    if "experience_level" in data:
        profile.experience_level = data["experience_level"]
    if "skills" in data:
        profile.skills = ",".join(data["skills"]) if isinstance(data["skills"], list) else data["skills"]
    if "preferred_roles" in data:
        roles = data["preferred_roles"]
        profile.preferred_roles = ",".join(roles) if isinstance(roles, list) else roles
    if "bio" in data:
        profile.bio = data["bio"]

    if "full_name" in data and data["full_name"]:
        user.full_name = data["full_name"]

    db.session.add(profile)
    db.session.commit()
    return jsonify(profile.to_dict())


@profile_bp.post("/onboarding-complete")
@require_auth
def complete_onboarding():
    user = request.current_user
    user.onboarding_complete = True
    db.session.commit()
    return jsonify(user.to_dict())


@profile_bp.delete("/account")
@require_auth
def delete_account():
    """Permanently deletes the user and all owned data (cascades via FKs)."""
    user = request.current_user
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Account deleted."})
