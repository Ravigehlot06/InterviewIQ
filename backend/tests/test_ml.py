from tests.conftest import register_and_login


def test_ml_predict_requires_auth(client):
    resp = client.post("/api/ml/predict", json={})
    assert resp.status_code == 401


def test_ml_predict_success(client):
    headers = register_and_login(client)
    payload = {
        "technical_score": 75, "communication_score": 80, "problem_solving_score": 70,
        "confidence_score": 72, "answer_quality": 78, "questions_answered": 5,
        "overall_score": 76, "difficulty": "medium", "experience_level": "0-2",
        "interview_type": "technical",
    }
    resp = client.post("/api/ml/predict", headers=headers, json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert "readiness_label" in data
    assert data["source"] in ("ml", "fallback")


def test_ml_predict_missing_fields(client):
    headers = register_and_login(client)
    resp = client.post("/api/ml/predict", headers=headers, json={"overall_score": 50})
    assert resp.status_code == 400
