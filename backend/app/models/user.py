import uuid
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


def _uuid():
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # nullable: Google-only accounts
    full_name = db.Column(db.String(255), nullable=False)
    auth_provider = db.Column(db.String(20), default="email")  # 'email' | 'google'
    google_id = db.Column(db.String(255), nullable=True, unique=True)
    is_active = db.Column(db.Boolean, default=True)
    onboarding_complete = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    profile = db.relationship("Profile", backref="user", uselist=False, cascade="all, delete-orphan")
    resumes = db.relationship("Resume", backref="user", cascade="all, delete-orphan")
    interviews = db.relationship("Interview", backref="user", cascade="all, delete-orphan")

    def set_password(self, raw_password: str):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "auth_provider": self.auth_provider,
            "onboarding_complete": self.onboarding_complete,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
