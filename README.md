# InterviewIQ

**Practice Interviews. Build Confidence. Get Interview-Ready.**

InterviewIQ is an AI-powered adaptive mock interview platform. It generates
interview questions live with Gemini, asks contextual follow-ups based on
your actual answers, evaluates your performance, and estimates your
practice readiness with a trained Random Forest model.

For the full beginner-friendly setup walkthrough, see **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)**.

## Stack

- **Frontend:** React + Vite + JavaScript, Tailwind CSS, Framer Motion, Lucide React, Axios, React Router
- **Backend:** Flask, SQLAlchemy, PostgreSQL, JWT auth, Google OAuth
- **GenAI:** Google Gemini API (with a clearly-labeled demo-mode fallback when no key is configured)
- **ML:** scikit-learn Random Forest — "Interview Readiness Estimate"
- **Docs:** `docs/` — architecture, GenAI, ML, database, API, user flow

## Quick start

```bash
# 1. Database (Docker)
docker compose up -d

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                # then fill in values
python ../scripts/seed.py
python ml/generate_demo_dataset.py
python ml/train.py
python run.py                                       # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                                          # http://localhost:5173
```

Without `GEMINI_API_KEY` set, the app still runs end-to-end using clearly
labeled **demo-mode** AI responses. See `docs/GENAI.md`.

## Project structure

```
InterviewIQ/
├── frontend/     React + Vite + Tailwind SPA
├── backend/      Flask REST API, SQLAlchemy models, Gemini + ML services
│   └── ml/       Dataset, training, evaluation, inference
├── docs/         Architecture, GenAI, ML, Database, API, User Flow
├── scripts/      Database seed script
└── docker-compose.yml   Local PostgreSQL
```

## Tests

```bash
cd backend
python -m pytest tests/ -v
```

## License

MIT — see [LICENSE](LICENSE).
