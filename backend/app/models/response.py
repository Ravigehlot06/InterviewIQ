from datetime import datetime, timezone
from app.extensions import db


class Response(db.Model):
    __tablename__ = "responses"

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(
        db.Integer, db.ForeignKey("interview_questions.id"), nullable=False, unique=True
    )

    answer_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    evaluation = db.relationship(
        "Evaluation", backref="response", uselist=False, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "answer_text": self.answer_text,
            "evaluation": self.evaluation.to_dict() if self.evaluation else None,
        }
