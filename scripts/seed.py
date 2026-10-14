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
    # Technical Roles
    ("software-developer", "Software Developer", "General-purpose software engineering & core problem solving.", "Code"),
    ("fullstack-developer", "Full Stack Developer", "Modern web apps, full-stack architecture, React & Node/Python.", "Layers"),
    ("frontend-developer", "Frontend Developer", "Interactive client-side interfaces, responsive UI/UX & performance.", "Layout"),
    ("backend-developer", "Backend Developer", "Distributed systems, REST/GraphQL APIs, databases & microservices.", "Server"),
    ("data-analyst", "Data Analyst", "Data cleaning, statistical querying, SQL, and business BI metrics.", "BarChart3"),
    ("data-scientist", "Data Scientist", "Statistical modeling, predictive algorithms, and applied machine learning.", "Brain"),
    ("ai-ml-engineer", "AI/ML Engineer", "LLM integrations, neural networks, PyTorch, and production MLOps.", "Cpu"),
    ("devops-engineer", "DevOps & Cloud Engineer", "CI/CD pipelines, Docker, Kubernetes, AWS/GCP cloud reliability.", "Cloud"),
    ("mobile-developer", "Mobile App Developer", "Native and cross-platform mobile apps for iOS and Android.", "Smartphone"),
    ("cybersecurity-analyst", "Cybersecurity Analyst", "Security posture, penetration testing, threat hunting & defense.", "ShieldCheck"),
    ("qa-engineer", "QA & Test Automation", "Automated test suites, end-to-end testing, and quality assurance.", "CheckCircle2"),
    ("systems-architect", "Systems Architect", "High-level architectural patterns, distributed scale & resilience.", "Network"),

    # Non-Technical & Business / Product Roles
    ("product-manager", "Product Manager", "Product vision, user discovery, feature roadmapping & stakeholder alignment.", "Compass"),
    ("ui-ux-designer", "UI/UX Designer", "User research, Figma wireframing, design systems & interaction design.", "Palette"),
    ("project-manager", "Project Manager / Scrum Master", "Agile methodologies, sprint execution, resource tracking & delivery.", "Kanban"),
    ("business-analyst", "Business Analyst", "Business process optimization, requirements gathering & stakeholder sync.", "LineChart"),
    ("hr-specialist", "HR & Talent Partner", "People operations, talent acquisition, culture & employee relations.", "Users"),
    ("marketing-specialist", "Marketing & Growth", "Campaign strategies, user acquisition, growth marketing & analytics.", "Megaphone"),
    ("sales-executive", "Sales & Business Development", "Client discovery, B2B enterprise negotiations, pipeline closing.", "Briefcase"),
    ("customer-success", "Customer Success Lead", "Client retention, onboarding delight, support workflows & renewals.", "HeartHandshake"),
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
