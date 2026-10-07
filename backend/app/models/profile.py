from datetime import datetime, timezone
from app.extensions import db


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), unique=True, nullable=False)

    education = db.Column(db.String(255), nullable=True)
    experience_level = db.Column(db.String(20), nullable=True)  # fresher/0-2/2-5/5+
    skills = db.Column(db.Text, nullable=True)  # comma-separated
    preferred_roles = db.Column(db.Text, nullable=True)  # comma-separated role slugs
    bio = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "education": self.education,
            "experience_level": self.experience_level,
            "skills": self.skills.split(",") if self.skills else [],
            "preferred_roles": self.preferred_roles.split(",") if self.preferred_roles else [],
            "bio": self.bio,
        }
