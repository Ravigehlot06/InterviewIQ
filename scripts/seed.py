"""
scripts/seed.py
----------------
Seeds roles and companies used by the interview setup screens.

Run from the backend/ directory:
    python ../scripts/seed.py
or from the project root:
    python scripts/seed.py
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app import create_app
from app.extensions import db
from app.models.role import Role
from app.models.company import Company

ROLES = [
    ("software-developer", "Software Developer", "General-purpose software engineering roles.", "Code"),
    ("data-analyst", "Data Analyst", "Data cleaning, analysis, and reporting roles.", "BarChart3"),
    ("data-scientist", "Data Scientist", "Statistical modeling and applied ML roles.", "Brain"),
    ("ai-ml-engineer", "AI/ML Engineer", "Applied machine learning and MLOps roles.", "Cpu"),
    ("web-developer", "Web Developer", "Frontend/backend web development roles.", "Globe"),
    ("android-developer", "Android Developer", "Native/cross-platform Android roles.", "Smartphone"),
]

COMPANIES = [
    ("google", "Google", "system design, algorithms, googleyness"),
    ("microsoft", "Microsoft", "data structures, collaboration, growth mindset"),
    ("amazon", "Amazon", "leadership principles, system design"),
    ("startup", "Fast-Growing Startup", "ownership, adaptability, full-stack breadth"),
]


def run():
    app = create_app()
    with app.app_context():
        for slug, name, desc, icon in ROLES:
            if not Role.query.filter_by(slug=slug).first():
                db.session.add(Role(slug=slug, name=name, description=desc, icon=icon))

        for slug, name, focus in COMPANIES:
            if not Company.query.filter_by(slug=slug).first():
                db.session.add(Company(slug=slug, name=name, focus_areas=focus))

        db.session.commit()
        print(f"Seeded {Role.query.count()} roles and {Company.query.count()} companies.")


if __name__ == "__main__":
    run()
