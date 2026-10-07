from flask import Blueprint, jsonify

from app.models.role import Role
from app.models.company import Company

role_bp = Blueprint("roles", __name__)


@role_bp.get("/roles")
def list_roles():
    roles = Role.query.order_by(Role.name).all()
    return jsonify([r.to_dict() for r in roles])


@role_bp.get("/companies")
def list_companies():
    companies = Company.query.order_by(Company.name).all()
    return jsonify([c.to_dict() for c in companies])
