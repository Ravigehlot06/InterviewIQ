from tests.conftest import register_and_login


def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "email": "new@example.com", "password": "password123", "full_name": "New User",
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@example.com"


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "email": "dup@example.com", "password": "password123", "full_name": "A",
    })
    resp = client.post("/api/auth/register", json={
        "email": "dup@example.com", "password": "password123", "full_name": "B",
    })
    assert resp.status_code == 409
    assert resp.get_json()["error"]["code"] == "email_exists"


def test_register_weak_password(client):
    resp = client.post("/api/auth/register", json={
        "email": "weak@example.com", "password": "short", "full_name": "A",
    })
    assert resp.status_code == 400


def test_login_success(client):
    client.post("/api/auth/register", json={
        "email": "login@example.com", "password": "password123", "full_name": "A",
    })
    resp = client.post("/api/auth/login", json={
        "email": "login@example.com", "password": "password123",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.get_json()


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "email": "wrong@example.com", "password": "password123", "full_name": "A",
    })
    resp = client.post("/api/auth/login", json={
        "email": "wrong@example.com", "password": "incorrect",
    })
    assert resp.status_code == 401


def test_protected_route_requires_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_protected_route_with_token(client):
    headers = register_and_login(client)
    resp = client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()["email"] == "user@example.com"


def test_invalid_token_rejected(client):
    resp = client.get("/api/auth/me", headers={"Authorization": "Bearer garbage.token.value"})
    assert resp.status_code == 401
