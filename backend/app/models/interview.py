import uuid
from datetime import datetime, timezone
from app.extensions import db


def _uuid():
    return str(uuid.uuid4())


class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey("companies.id"), nullable=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=True)

    experience_level = db.Column(db.String(20), nullable=False)  # fresher/0-2/2-5/5+
    difficulty = db.Column(db.String(10), nullable=False)  # easy/medium/hard
    interview_type = db.Column(db.String(20), nullable=False)  # hr/technical/role_based/company
    planned_questions = db.Column(db.Integer, default=6)

    status = db.Column(db.String(20), default="in_progress")  # in_progress/completed/abandoned
    started_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)

    questions = db.relationship(
        "InterviewQuestion", backref="interview", cascade="all, delete-orphan",
        order_by="InterviewQuestion.sequence",
    )
    report = db.relationship("Report", backref="interview", uselist=False, cascade="all, delete-orphan")
    role = db.relationship("Role")
    company = db.relationship("Company")

    def duration_seconds(self):
        if self.completed_at:
            return int((self.completed_at - self.started_at).total_seconds())
        return None

    def to_dict(self, include_questions=False):
        data = {
            "id": self.id,
            "role": self.role.to_dict() if self.role else None,
            "company": self.company.to_dict() if self.company else None,
            "experience_level": self.experience_level,
            "difficulty": self.difficulty,
            "interview_type": self.interview_type,
            "planned_questions": self.planned_questions,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration_seconds": self.duration_seconds(),
        }
        if include_questions:
            data["questions"] = [q.to_dict() for q in self.questions]
        return data
