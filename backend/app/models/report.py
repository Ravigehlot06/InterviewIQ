from datetime import datetime, timezone
from app.extensions import db


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.String(36), db.ForeignKey("interviews.id"), nullable=False, unique=True)

    overall_score = db.Column(db.Float, nullable=False)
    technical_score = db.Column(db.Float, nullable=True)
    communication_score = db.Column(db.Float, nullable=True)
    problem_solving_score = db.Column(db.Float, nullable=True)
    answer_quality_score = db.Column(db.Float, nullable=True)

    strengths = db.Column(db.Text, nullable=True)         # comma-separated
    areas_to_improve = db.Column(db.Text, nullable=True)  # comma-separated
    ai_feedback_summary = db.Column(db.Text, nullable=True)
    recommended_practice_areas = db.Column(db.Text, nullable=True)  # comma-separated

    readiness_label = db.Column(db.String(30), nullable=True)   # e.g. "Interview Ready"
    readiness_score = db.Column(db.Float, nullable=True)         # 0-100, from ML model
    readiness_source = db.Column(db.String(10), default="ml")    # 'ml' | 'fallback'

    suggested_next_interview = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "overall_score": self.overall_score,
            "technical_score": self.technical_score,
            "communication_score": self.communication_score,
            "problem_solving_score": self.problem_solving_score,
            "answer_quality_score": self.answer_quality_score,
            "strengths": self.strengths.split(",") if self.strengths else [],
            "areas_to_improve": self.areas_to_improve.split(",") if self.areas_to_improve else [],
            "ai_feedback_summary": self.ai_feedback_summary,
            "recommended_practice_areas": (
                self.recommended_practice_areas.split(",") if self.recommended_practice_areas else []
            ),
            "readiness_label": self.readiness_label,
            "readiness_score": self.readiness_score,
            "readiness_source": self.readiness_source,
            "suggested_next_interview": self.suggested_next_interview,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
