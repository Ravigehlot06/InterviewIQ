# InterviewIQ — Project Guide

A complete, beginner-friendly walkthrough of what InterviewIQ is, how it's
built, and exactly how to run it from a clean machine.

---

## 1. What is InterviewIQ?

InterviewIQ is an AI-powered mock interview platform. A user picks a role
(and optionally a target company), sets their experience level and
difficulty, and starts a text-based interview. The AI (Google Gemini) asks
a question, the user answers, and the AI generates a **contextual
follow-up question** based on what the user actually wrote — not a
scripted next question. When the interview ends, the app evaluates the
answers, a trained Random Forest model estimates the user's **practice
readiness**, and a report is saved to their history.

## 2. Features

- Email/password and Google OAuth authentication (JWT-based)
- Guided onboarding (profile, skills, optional resume upload)
- Resume-aware interview questions (PDF/DOCX parsing)
- Sequential interview setup (role → company → resume → experience →
  difficulty → type → question count)
- Live, one-question-at-a-time AI interview engine with real follow-up logic
- Per-answer AI evaluation (technical, communication, problem-solving,
  relevance, confidence)
- Final report: overall score, strengths, areas to improve, AI feedback,
  ML-based Interview Readiness Estimate
- Dashboard, interview history, profile, and settings
- Fully functional **demo mode** when no Gemini API key is configured

## 3. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS v4, Framer Motion, Lucide React, Axios, React Router |
| Backend | Python, Flask, Flask-CORS, SQLAlchemy, PostgreSQL, PyJWT |
| GenAI | Google Gemini API (`google-genai` SDK) |
| ML | pandas, NumPy, scikit-learn (Random Forest) |
| Documents | pypdf, python-docx |
| Auth | JWT access/refresh tokens, Google OAuth 2.0 |

## 4. Folder structure

```
InterviewIQ/
├── frontend/
│   └── src/
│       ├── components/   (landing/, ui/, ProtectedRoute)
│       ├── pages/         (Landing, Login, Signup, Dashboard, Interview*, Report, ...)
│       ├── layouts/       (AppLayout)
│       ├── context/       (AuthContext)
│       ├── services/      (api.js, authService.js, index.js)
├── backend/
│   ├── app/
│   │   ├── routes/        (auth, profile, resumes, roles, interviews, reports, dashboard, ml)
│   │   ├── models/        (User, Profile, Resume, Role, Company, Interview, ...)
│   │   ├── services/      (gemini_service.py, resume_service.py, ml_service.py)
│   │   ├── middleware/    (auth_middleware.py)
│   │   └── utils/         (jwt_utils.py, errors.py)
│   ├── ml/                (generate_demo_dataset.py, train.py, evaluate.py, predict.py, data/, models/)
│   └── tests/             (pytest suite)
├── docs/                  (ARCHITECTURE, GENAI, ML, DATABASE, API, USER_FLOW)
└── scripts/seed.py
```

## 5. Prerequisites

- **Python** 3.11+ (`python --version`)
- **Node.js** 18+ and npm (`node --version`)
- **PostgreSQL** 14+ (or Docker, for `docker compose up -d`)
- A code editor (VS Code recommended)
- (Optional) A **Gemini API key** — the app works in demo mode without one
- (Optional) **Google OAuth credentials** — email/password auth works without them

## 6. Environment variables

Copy the example files and fill in real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env` variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` / `JWT_SECRET_KEY` | Random long strings, keep private |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth (optional) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini access (optional — demo mode without it) |
| `FRONTEND_URL` / `BACKEND_URL` | CORS + redirect targets |
| `UPLOAD_FOLDER` / `MAX_UPLOAD_SIZE_MB` | Resume upload storage |
| `ML_MODEL_PATH` | Path to the trained readiness model |

`frontend/.env`:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Flask API, e.g. `http://localhost:5000/api` |

## 7. PostgreSQL setup

**Option A — Docker (recommended):**

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with database `interviewiq`,
user `interviewiq_user`, password `interviewiq_pass` (already matches
`backend/.env.example`).

**Option B — Local install:**

```sql
CREATE DATABASE interviewiq;
CREATE USER interviewiq_user WITH PASSWORD 'interviewiq_pass';
GRANT ALL PRIVILEGES ON DATABASE interviewiq TO interviewiq_user;
```

Then set `DATABASE_URL` in `backend/.env` accordingly.

Tables are created automatically the first time the Flask app starts
(`db.create_all()` in `app/__init__.py`) — no separate migration step is
required for this project's scope.

## 8. Google OAuth setup (optional)

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. Create an **OAuth 2.0 Client ID** (type: Web application).
3. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`.
4. Copy the Client ID and Secret into `backend/.env`.

If left blank, `/api/auth/google` returns a clear "not configured" error
and email/password auth continues to work normally.

## 9. Gemini API setup (optional)

1. Go to <https://aistudio.google.com/app/apikey>.
2. Create an API key.
3. Set `GEMINI_API_KEY` and `GEMINI_MODEL` (e.g. `gemini-1.5-flash`) in `backend/.env`.

If left blank, `app/services/gemini_service.py` automatically runs in
**demo mode**: every question, follow-up, and evaluation is generated by a
deterministic, clearly-labeled mock instead of a real Gemini call
(`"source": "demo"` in every relevant API response).

## 10. Beginner run guide (exact commands)

**STEP 1 — Install prerequisites** (Python, Node.js, PostgreSQL or Docker).

**STEP 2 — Open the project in VS Code.**

```bash
code InterviewIQ
```

**STEP 3 — Install frontend dependencies.**

```bash
cd frontend
npm install
```

**STEP 4 — Create a Python virtual environment.**

```bash
cd ../backend
python -m venv venv
```

**STEP 5 — Activate the virtual environment.**

- macOS/Linux: `source venv/bin/activate`
- Windows (cmd): `venv\Scripts\activate.bat`
- Windows (PowerShell): `venv\Scripts\Activate.ps1`

**STEP 6 — Install backend requirements.**

```bash
pip install -r requirements.txt
```

**STEP 7 — Create the PostgreSQL database** (see Section 7).

```bash
docker compose up -d          # run from the project root
```

**STEP 8 — Copy `.env.example` → `.env`.**

```bash
cp .env.example .env          # backend/.env
```

**STEP 9 — Add API credentials** to `backend/.env` (optional — demo mode
works without them).

**STEP 10 — Initialize the database.** Tables are created automatically
the first time you run the app (next step) — no separate command needed.

**STEP 11 — Seed roles and companies.**

```bash
cd ..                          # project root
python scripts/seed.py
```

**STEP 12 — Generate the demo dataset and train the ML model.**

```bash
cd backend
python ml/generate_demo_dataset.py
python ml/train.py
```

**STEP 13 — Start Flask.**

```bash
python run.py
# Running on http://localhost:5000
```

**STEP 14 — Start React** (new terminal).

```bash
cd frontend
cp .env.example .env
npm run dev
# Local: http://localhost:5173
```

**STEP 15 — Open your browser** at <http://localhost:5173>.

### Exact Windows commands (PowerShell)

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
cd ..
python scripts\seed.py
cd backend
python ml\generate_demo_dataset.py
python ml\train.py
python run.py
```

## 11. Complete user flow

Signup/Google login → onboarding (profile, skills, optional resume) →
dashboard → interview setup (role → company → resume → experience →
difficulty → type → question count) → live interview (question → answer
→ AI evaluates → contextual follow-up → repeat) → completion → final
AI feedback + ML readiness estimate → report → saved to history →
dashboard shows updated progress.

See `docs/USER_FLOW.md` for the full diagram.

## 12. Architecture, GenAI, ML, Database, API

See the dedicated docs:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/GENAI.md`](docs/GENAI.md)
- [`docs/ML.md`](docs/ML.md)
- [`docs/DATABASE.md`](docs/DATABASE.md)
- [`docs/API.md`](docs/API.md)
- [`docs/USER_FLOW.md`](docs/USER_FLOW.md)

## 13. Testing

```bash
cd backend
python -m pytest tests/ -v
```

16 automated tests cover registration, login, protected routes, token
validation, interview creation/authorization, the full interview →
answer → follow-up → completion → report flow, and the ML prediction
endpoint. All 16 currently pass.

Manual verification performed during development: signup, login, Google
OAuth configuration path (with and without credentials), dashboard,
full interview flow, report rendering, history, and responsive layout
at mobile/tablet/desktop widths.

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| `psycopg2` install fails | Ensure PostgreSQL client headers are installed, or use the `psycopg2-binary` wheel already pinned in `requirements.txt` |
| CORS errors in the browser console | Confirm `FRONTEND_URL` in `backend/.env` matches the URL you're opening the app from |
| "Google login is not configured" | Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` in `backend/.env` |
| AI responses say "Demo-mode" | Expected when `GEMINI_API_KEY` is empty — set a real key to use live Gemini |
| `ml_service` uses "fallback" readiness | Run `python ml/train.py` first so `ml/models/readiness_model.joblib` exists |
| 401 errors after a while | Access tokens expire after `JWT_ACCESS_TOKEN_EXPIRES_MINUTES` (default 60) — log in again |

## 15. Production deployment notes

This project is built as a modular monolith intentionally sized for a
final-year/portfolio project — not a microservices deployment. For a real
deployment:

- Run Flask behind **gunicorn** (already in `requirements.txt`) with a
  reverse proxy (e.g. Nginx).
- Serve the frontend as a static build (`npm run build` → `frontend/dist`)
  from a CDN or the same reverse proxy.
- Use a managed PostgreSQL instance and rotate `JWT_SECRET_KEY`/`SECRET_KEY`.
- Set `FLASK_DEBUG=0` and configure real `GEMINI_API_KEY` / Google OAuth
  credentials with production redirect URIs.
- Re-train the ML model on real `PerformanceMetric` data once enough
  production interviews have been completed (see `docs/ML.md`).
