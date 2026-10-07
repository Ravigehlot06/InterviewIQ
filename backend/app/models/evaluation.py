from datetime import datetime, timezone
from app.extensions import db


class Evaluation(db.Model):
    __tablename__ = "evaluations"

    id = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey("responses.id"), nullable=False, unique=True)

    technical_score = db.Column(db.Float, nullable=True)     # 0-100
    communication_score = db.Column(db.Float, nullable=True)  # 0-100
    problem_solving_score = db.Column(db.Float, nullable=True)  # 0-100
    relevance_score = db.Column(db.Float, nullable=True)      # 0-100
    confidence_score = db.Column(db.Float, nullable=True)     # 0-100

    feedback = db.Column(db.Text, nullable=True)
    key_points_detected = db.Column(db.Text, nullable=True)  # comma-separated topics used for follow-up
    source = db.Column(db.String(10), default="gemini")  # 'gemini' | 'demo'

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "technical_score": self.technical_score,
            "communication_score": self.communication_score,
            "problem_solving_score": self.problem_solving_score,
            "relevance_score": self.relevance_score,
            "confidence_score": self.confidence_score,
            "feedback": self.feedback,
            "key_points_detected": self.key_points_detected.split(",") if self.key_points_detected else [],
            "source": self.source,
        }
