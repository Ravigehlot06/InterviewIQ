from datetime import datetime, timezone
from app.extensions import db


class PerformanceMetric(db.Model):
    """One row per completed interview - a flattened feature set.

    This table is what the ML training/prediction pipeline reads from
    (in production). It keeps the dashboard's aggregate queries fast and
    keeps ML feature engineering decoupled from the normalized schema.
    """

    __tablename__ = "performance_metrics"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    interview_id = db.Column(db.String(36), db.ForeignKey("interviews.id"), nullable=False, unique=True)

    technical_score = db.Column(db.Float, nullable=False)
    communication_score = db.Column(db.Float, nullable=False)
    problem_solving_score = db.Column(db.Float, nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    answer_quality = db.Column(db.Float, nullable=False)
    questions_answered = db.Column(db.Integer, nullable=False)
    overall_score = db.Column(db.Float, nullable=False)

    difficulty = db.Column(db.String(10), nullable=False)
    experience_level = db.Column(db.String(20), nullable=False)
    interview_type = db.Column(db.String(20), nullable=False)

    readiness_label = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "technical_score": self.technical_score,
            "communication_score": self.communication_score,
            "problem_solving_score": self.problem_solving_score,
            "confidence_score": self.confidence_score,
            "answer_quality": self.answer_quality,
            "questions_answered": self.questions_answered,
            "overall_score": self.overall_score,
            "difficulty": self.difficulty,
            "experience_level": self.experience_level,
            "interview_type": self.interview_type,
            "readiness_label": self.readiness_label,
        }
