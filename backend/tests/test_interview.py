from tests.conftest import register_and_login


def _get_role_id(client, headers):
    resp = client.get("/api/roles")
    return resp.get_json()[0]["id"]


def test_create_interview(client):
    headers = register_and_login(client)
    role_id = _get_role_id(client, headers)

    resp = client.post("/api/interviews", headers=headers, json={
        "role_id": role_id, "experience_level": "fresher",
        "difficulty": "easy", "interview_type": "hr", "planned_questions": 2,
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["interview"]["status"] == "in_progress"
    assert data["current_question"]["question_text"]
    assert data["ai_source"] == "demo"  # no GEMINI_API_KEY in test env


def test_interview_requires_valid_role(client):
    headers = register_and_login(client)
    resp = client.post("/api/interviews", headers=headers, json={
        "role_id": 99999, "experience_level": "fresher",
        "difficulty": "easy", "interview_type": "hr",
    })
    assert resp.status_code == 404


def test_cannot_access_other_users_interview(client):
    headers_a = register_and_login(client, "a@example.com")
    headers_b = register_and_login(client, "b@example.com")
    role_id = _get_role_id(client, headers_a)

    create_resp = client.post("/api/interviews", headers=headers_a, json={
        "role_id": role_id, "experience_level": "fresher",
        "difficulty": "easy", "interview_type": "hr",
    })
    interview_id = create_resp.get_json()["interview"]["id"]

    resp = client.get(f"/api/interviews/{interview_id}", headers=headers_b)
    assert resp.status_code == 404


def test_full_interview_flow_and_report(client):
    headers = register_and_login(client)
    role_id = _get_role_id(client, headers)

    create_resp = client.post("/api/interviews", headers=headers, json={
        "role_id": role_id, "experience_level": "0-2",
        "difficulty": "medium", "interview_type": "technical", "planned_questions": 2,
    })
    body = create_resp.get_json()
    interview_id = body["interview"]["id"]
    q1_id = body["current_question"]["id"]

    ans_resp = client.post(f"/api/interviews/{interview_id}/answer", headers=headers, json={
        "question_id": q1_id, "answer_text": "I used pandas to clean a large dataset for a project.",
    })
    assert ans_resp.status_code == 200
    assert ans_resp.get_json()["response"]["evaluation"]["source"] == "demo"

    next_resp = client.post(f"/api/interviews/{interview_id}/next-question", headers=headers)
    assert next_resp.status_code == 200
    q2_id = next_resp.get_json()["current_question"]["id"]
    assert next_resp.get_json()["current_question"]["is_follow_up"] is True

    client.post(f"/api/interviews/{interview_id}/answer", headers=headers, json={
        "question_id": q2_id, "answer_text": "I handled missing values using median imputation.",
    })

    complete_resp = client.post(f"/api/interviews/{interview_id}/complete", headers=headers)
    assert complete_resp.status_code == 200
    report = complete_resp.get_json()["report"]
    assert 0 <= report["overall_score"] <= 100
    assert report["readiness_label"] is not None
    assert report["readiness_source"] in ("ml", "fallback")

    report_resp = client.get(f"/api/reports/{interview_id}", headers=headers)
    assert report_resp.status_code == 200

    dash_resp = client.get("/api/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    assert dash_resp.get_json()["interview_count"] == 1


def test_answer_requires_question_id(client):
    headers = register_and_login(client)
    role_id = _get_role_id(client, headers)
    create_resp = client.post("/api/interviews", headers=headers, json={
        "role_id": role_id, "experience_level": "fresher",
        "difficulty": "easy", "interview_type": "hr",
    })
    interview_id = create_resp.get_json()["interview"]["id"]
    resp = client.post(f"/api/interviews/{interview_id}/answer", headers=headers, json={
        "answer_text": "no question id provided",
    })
    assert resp.status_code == 400
