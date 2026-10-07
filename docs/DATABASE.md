# Database

## Why PostgreSQL?

InterviewIQ's data is inherently relational: a user has profiles, resumes,
and many interviews; each interview has many questions; each question has
one response; each response has one evaluation. Foreign keys and joins are
the natural fit, and PostgreSQL gives strong consistency guarantees,
mature tooling, and easy hosting — a better fit than a document store for
this shape of data.

## Tables

| Table | Stores |
|---|---|
| `users` | Account credentials (hashed), auth provider, onboarding state |
| `profiles` | Education, experience level, skills, preferred roles, bio (1:1 with users) |
| `resumes` | Uploaded resume metadata + parsed structured fields |
| `roles` | Selectable interview roles (Software Developer, Data Scientist, ...) |
| `companies` | Selectable target-company practice contexts |
| `interviews` | One practice session: role, company, resume, settings, status |
| `interview_questions` | Each question asked in an interview, in sequence, with follow-up linkage |
| `responses` | The candidate's answer to one question (1:1 with a question) |
| `evaluations` | Structured AI scoring of one response (1:1 with a response) |
| `reports` | Aggregated final report for a completed interview (1:1 with an interview) |
| `performance_metrics` | Flattened feature row per completed interview, used by the ML pipeline |

## Relationships (ER-style diagram)

```
users (1) ───< (1) profiles
users (1) ───< (N) resumes
users (1) ───< (N) interviews

roles (1) ───< (N) interviews
companies (1) ─< (N) interviews        [nullable — company is optional]
resumes (1) ──< (N) interviews         [nullable — resume is optional]

interviews (1) ──< (N) interview_questions
interview_questions (1) ── (1) responses
responses (1) ── (1) evaluations
interviews (1) ── (1) reports
interviews (1) ── (1) performance_metrics
users (1) ───< (N) performance_metrics
```

## Key design notes

- **Primary keys:** `users` and `interviews` use UUID strings (generated
  in Python) since they're referenced externally (JWT `sub`, frontend
  routes) and benefit from non-guessable IDs. Other tables use
  auto-incrementing integers, which is sufficient since they're only
  referenced internally.
- **Foreign keys:** every child table references its parent
  (`user_id`, `interview_id`, `question_id`, `response_id`) with
  `db.ForeignKey`, and `cascade="all, delete-orphan"` is used on the
  `User` → `Profile`/`Resume`/`Interview` and `Interview` → `Questions`/
  `Report` relationships, so deleting a user or interview cleanly removes
  its dependent rows.
- **Timestamps:** `created_at` (and `updated_at` where rows are edited)
  are present on every table that represents an event or mutable record.
- **Indexes:** `user_id` and `interview_id` foreign keys used in frequent
  lookups (`interviews.user_id`, `interview_questions.interview_id`,
  `performance_metrics.user_id`) are indexed (`index=True`).
- **No duplicated data:** role/company names are stored once in
  `roles`/`companies` and referenced by ID everywhere else; resume parsed
  fields live only on `resumes`, not copied onto `interviews`.
- **`performance_metrics` exists deliberately** as a denormalized,
  flattened table separate from the normalized schema above — it exists
  specifically to be the ML training/export source (see `docs/ML.md`),
  keeping ML feature engineering decoupled from the transactional schema.

## Initialization

Tables are created automatically on first Flask startup via
`db.create_all()` in `app/__init__.py` — no separate migration tool is
used, matching this project's intentionally simple scope. `scripts/seed.py`
populates `roles` and `companies` with example values.
