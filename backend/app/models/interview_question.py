from datetime import datetime, timezone
from app.extensions import db


class InterviewQuestion(db.Model):
    __tablename__ = "interview_questions"

    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.String(36), db.ForeignKey("interviews.id"), nullable=False, index=True)

    sequence = db.Column(db.Integer, nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), nullable=False)  # opening/follow_up/technical/behavioral
    is_follow_up = db.Column(db.Boolean, default=False)
    parent_question_id = db.Column(db.Integer, db.ForeignKey("interview_questions.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    response = db.relationship("Response", backref="question", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "sequence": self.sequence,
            "question_text": self.question_text,
            "question_type": self.question_type,
            "is_follow_up": self.is_follow_up,
            "response": self.response.to_dict() if self.response else None,
        }
