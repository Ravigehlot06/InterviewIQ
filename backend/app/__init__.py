"""
InterviewIQ Flask Application Factory
--------------------------------------
Builds and configures the Flask app: extensions, blueprints,
error handlers and CORS. Kept intentionally small - all real
logic lives in routes/services/models.
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from app.extensions import db
from app.utils.errors import register_error_handlers

load_dotenv()


def create_app(config_overrides: dict | None = None) -> Flask:
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///interviewiq_dev.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES_MINUTES"] = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "60")
    )
    app.config["JWT_REFRESH_TOKEN_EXPIRES_DAYS"] = int(
        os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "7")
    )
    app.config["MAX_CONTENT_LENGTH"] = int(
        os.getenv("MAX_UPLOAD_SIZE_MB", "5")
    ) * 1024 * 1024
    app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads/resumes")
    app.config["FRONTEND_URL"] = os.getenv("FRONTEND_URL", "http://localhost:5173")

    if config_overrides:
        app.config.update(config_overrides)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    logging.basicConfig(level=logging.INFO)

    db.init_app(app)

    frontend_url = app.config.get("FRONTEND_URL", "http://localhost:5173")
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    r"^https?://localhost(:\d+)?$",
                    r"^https?://127\.0\.0\.1(:\d+)?$",
                    frontend_url,
                ]
            }
        },
        supports_credentials=True,
    )

    # --- Register blueprints ---
    from app.routes.auth_routes import auth_bp
    from app.routes.profile_routes import profile_bp
    from app.routes.resume_routes import resume_bp
    from app.routes.role_routes import role_bp
    from app.routes.interview_routes import interview_bp
    from app.routes.report_routes import report_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.ml_routes import ml_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(resume_bp, url_prefix="/api/resumes")
    app.register_blueprint(role_bp, url_prefix="/api")
    app.register_blueprint(interview_bp, url_prefix="/api/interviews")
    app.register_blueprint(report_bp, url_prefix="/api/reports")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(ml_bp, url_prefix="/api/ml")

    register_error_handlers(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "InterviewIQ API"})

    with app.app_context():
        from app.models import (  # noqa: F401
            user, profile, resume, role, company, interview,
            interview_question, response, evaluation, report,
            performance_metric,
        )
        db.create_all()

    return app
