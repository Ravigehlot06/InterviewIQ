from app.extensions import db


class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(60), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    focus_areas = db.Column(db.String(255), nullable=True)  # e.g. "system design, DSA"

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "focus_areas": self.focus_areas,
            "note": "Simulated practice context only. Not official interview material.",
        }
