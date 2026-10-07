# API Reference

Base URL: `http://localhost:5000/api`

Authenticated endpoints require header: `Authorization: Bearer <access_token>`

All error responses share this shape:

```json
{ "error": { "code": "some_code", "message": "Human-readable message." } }
```

---

## Auth

### `POST /auth/register`
**Auth:** none
**Body:** `{ "email", "password" (min 8 chars), "full_name" }`
**201:** `{ "access_token", "refresh_token", "user" }`
**Errors:** `400 validation_error`, `409 email_exists`

### `POST /auth/login`
**Auth:** none
**Body:** `{ "email", "password" }`
**200:** `{ "access_token", "refresh_token", "user" }`
**Errors:** `401 invalid_credentials`, `403 account_inactive`

### `GET /auth/me`
**Auth:** required
**200:** user object

### `POST /auth/logout`
**Auth:** required
**200:** `{ "message": "Logged out." }` (stateless JWT — client discards tokens)

### `GET /auth/google`
**Auth:** none — redirects to Google's consent screen.
**503** `google_oauth_not_configured` if env vars are missing.

### `GET /auth/google/callback`
**Auth:** none — Google redirects here; app redirects to
`FRONTEND_URL/auth/callback?access_token=...&refresh_token=...`.

---

## Profile

### `GET /profile`
**Auth:** required. **200:** profile object (empty defaults if none saved yet).

### `PUT /profile`
**Auth:** required.
**Body (all optional):** `{ "full_name", "education", "experience_level", "skills": [], "preferred_roles": [], "bio" }`
**200:** updated profile object.

### `POST /profile/onboarding-complete`
**Auth:** required. Marks `onboarding_complete = true`. **200:** user object.

### `DELETE /profile/account`
**Auth:** required. Permanently deletes the user and all owned data.
**200:** `{ "message": "Account deleted." }`

---

## Resumes

### `POST /resumes`
**Auth:** required. **Body:** multipart form, field `file` (PDF or DOCX, ≤ `MAX_UPLOAD_SIZE_MB`).
**201:** resume object with `parsed` fields.
**Errors:** `400 validation_error`, `400 unsupported_file_type`, `422 resume_parse_failed`

### `GET /resumes`
**Auth:** required. **200:** array of the user's resumes.

### `DELETE /resumes/:id`
**Auth:** required, owner only. **200:** `{ "message": "Resume deleted." }`

---

## Roles & Companies

### `GET /roles`
**Auth:** none. **200:** array of `{ id, slug, name, description, icon }`

### `GET /companies`
**Auth:** none. **200:** array of `{ id, slug, name, focus_areas, note }`

---

## Interviews

### `POST /interviews`
**Auth:** required.
**Body:** `{ "role_id", "experience_level", "difficulty", "interview_type", "company_id"?, "resume_id"?, "planned_questions"? }`
**201:** `{ "interview", "current_question", "ai_source" }`

### `GET /interviews`
**Auth:** required. **200:** array of the user's interviews (summary).

### `GET /interviews/:id`
**Auth:** required, owner only. **200:** interview with full `questions[]` (each including its `response`/`evaluation`).

### `POST /interviews/:id/answer`
**Auth:** required, owner only, interview must be `in_progress`.
**Body:** `{ "question_id", "answer_text" }`
**200:** `{ "response": { answer_text, evaluation } }`
**Errors:** `409 interview_not_active`, `404 not_found`, `409 already_answered`

### `POST /interviews/:id/next-question`
**Auth:** required, owner only. Generates the next question (follow-up or new topic).
**200:** `{ "current_question", "ai_source", "questions_answered", "planned_questions" }`
**Errors:** `409 interview_complete_pending` once `planned_questions` have been answered.

### `POST /interviews/:id/complete`
**Auth:** required, owner only. Finalizes scoring, AI feedback, and ML readiness estimate.
**200:** `{ "interview", "report" }`
**Errors:** `409 already_completed`

---

## Reports

### `GET /reports/:interview_id`
**Auth:** required, owner only.
**200:** full report object + nested `interview` (with all Q&A).
**Errors:** `404 report_not_ready` if the interview hasn't been completed.

---

## Dashboard & History

### `GET /dashboard`
**Auth:** required.
**200:** `{ welcome_name, interview_count, average_score, latest_readiness, role_performance, recent_improvement, recent_interviews[] }`

### `GET /history`
**Auth:** required.
**200:** array of all interviews with `score` and `readiness` attached.

---

## ML

### `POST /ml/predict`
**Auth:** required.
**Body:** `{ technical_score, communication_score, problem_solving_score, confidence_score, answer_quality, questions_answered, overall_score, difficulty, experience_level, interview_type }`
**200:** `{ "readiness_label", "readiness_score", "source": "ml"|"fallback" }`

---

## Health

### `GET /health`
**Auth:** none. **200:** `{ "status": "ok", "service": "InterviewIQ API" }`
