# Architecture

InterviewIQ is a **modular monolith**: one React frontend, one Flask
backend, one PostgreSQL database. This keeps the system easy to run,
debug, and explain, while still separating concerns cleanly through
routes → services → models.

## Why these choices (viva-friendly)

- **Why React + Vite?** Fast dev server, component reuse across the
  onboarding/interview/report flows, huge ecosystem (Framer Motion,
  Lucide, React Router) for a premium, animated UI without heavy setup.
- **Why Flask?** Lightweight, explicit, easy to structure into
  blueprints/services/models without hidden magic — good for a project
  that needs to be explained line by line.
- **Why PostgreSQL?** Relational integrity (foreign keys between users,
  interviews, questions, responses, evaluations) matters here — this is
  not a document-shaped problem.
- **Why Gemini?** A hosted, general-purpose LLM avoids the cost and
  complexity of training a model capable of natural conversation; it lets
  the project focus its own ML work on a problem better suited to
  classical ML (readiness classification from structured scores).
- **Why Random Forest for readiness?** The readiness signal comes from a
  handful of structured, moderately correlated numeric/categorical
  features — Random Forest handles that well, is robust to overfitting
  with sensible depth limits, and produces feature importances that are
  easy to explain.

## High-level request flow

```mermaid
flowchart LR
    User((User)) --> React[React + Vite SPA]
    React -->|Axios / REST + JWT| Flask[Flask REST API]
    Flask --> Services[Service layer]
    Services --> DB[(PostgreSQL)]
    Services --> Gemini[Gemini API]
    Services --> ML[Random Forest model]
```

## Backend internal structure

```mermaid
flowchart TD
    Routes[app/routes/*] --> Middleware[auth_middleware.require_auth]
    Routes --> Services[app/services/*]
    Services --> Models[app/models/* SQLAlchemy]
    Models --> DB[(PostgreSQL)]
    Services -->|gemini_service.py| Gemini[Gemini API / Demo fallback]
    Services -->|ml_service.py| MLPredict[ml/predict.py]
    MLPredict --> Artifact[(readiness_model.joblib)]
```

## Interview engine sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Flask API
    participant G as Gemini service
    participant D as Database

    U->>F: Complete interview setup
    F->>A: POST /api/interviews
    A->>G: generate_interview_question(context)
    G-->>A: opening question
    A->>D: save Interview + InterviewQuestion
    A-->>F: interview + current_question

    loop each question
        U->>F: submit answer
        F->>A: POST /interviews/:id/answer
        A->>G: evaluate_answer(question, answer)
        G-->>A: scores + feedback
        A->>D: save Response + Evaluation
        F->>A: POST /interviews/:id/next-question
        A->>G: generate_follow_up_question(context)
        G-->>A: contextual follow-up
        A->>D: save InterviewQuestion
        A-->>F: current_question
    end

    F->>A: POST /interviews/:id/complete
    A->>G: generate_final_feedback(evaluations)
    A->>A: ml_service.get_readiness_estimate(features)
    A->>D: save Report + PerformanceMetric
    A-->>F: report
```

## Deployment shape

A single Flask process (gunicorn in production) serves the REST API; the
React app is built to static files and served separately (CDN/static
host or the same reverse proxy). PostgreSQL is the single source of
truth. No message queues, no microservices, no container orchestration —
intentionally, per the project's scope (see `docs/../PROJECT_GUIDE.md`
§15).
