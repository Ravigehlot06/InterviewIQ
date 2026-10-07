import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("GEMINI_API_KEY", "")  # force demo mode in tests
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("SECRET_KEY", "test-secret")

from app import create_app
from app.extensions import db
from app.models.role import Role
from app.models.company import Company


@pytest.fixture()
def app():
    application = create_app({
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "TESTING": True,
        "UPLOAD_FOLDER": "/tmp/interviewiq_test_uploads",
    })
    with application.app_context():
        db.create_all()
        db.session.add(Role(slug="software-developer", name="Software Developer"))
        db.session.add(Company(slug="google", name="Google"))
        db.session.commit()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def register_and_login(client, email="user@example.com"):
    client.post("/api/auth/register", json={
        "email": email, "password": "password123", "full_name": "Test User",
    })
    resp = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    token = resp.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
