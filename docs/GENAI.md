# Generative AI Architecture

## What is GenAI, in this project?

InterviewIQ uses a hosted large language model (Google **Gemini**) to
generate interview questions, contextual follow-ups, per-answer
evaluations, and final feedback — all dynamically, per interview, rather
than from a static question bank.

## What LLM is used, and why a pre-trained one?

We use **Gemini** (model configurable via `GEMINI_MODEL`, default
`gemini-1.5-flash`) through the official `google-genai` Python SDK.

We do **not** train our own LLM because:
- Training a model capable of open-ended, coherent natural-language
  interviewing from scratch requires enormous compute and data far beyond
  the scope of this project.
- A hosted, general-purpose LLM already understands language, reasoning,
  and domain knowledge (software engineering, data science, HR practices)
  well enough to ask realistic questions and evaluate answers.
- This lets the project's *own* ML work focus on a problem better suited
  to a from-scratch model trained on project-specific data: **readiness
  classification** (see `docs/ML.md`).

## Where GenAI is used

All Gemini calls are isolated in **`backend/app/services/gemini_service.py`**
— routes never call the SDK directly. Five functions:

| Function | Purpose |
|---|---|
| `generate_interview_question(context)` | Opening / new-topic question |
| `generate_follow_up_question(context)` | Contextual follow-up based on the last answer |
| `evaluate_answer(context)` | Per-answer structured scoring + feedback |
| `generate_final_feedback(context)` | Aggregates all evaluations into strengths/weaknesses |
| `generate_interview_summary(context)` | One-paragraph plain-text summary |

## Prompt engineering strategy

A single reusable **system prompt** (`SYSTEM_PROMPT` in
`gemini_service.py`) establishes the interviewer persona and hard rules:
ask realistic questions, never reveal answers except when evaluating,
never repeat a question, stay professional, avoid discriminatory
questions, and return **only valid JSON** when structured output is
requested.

Each function then builds a **task-specific prompt** on top of that
system prompt, injecting:

- **Role / company context** — `role_name`, `company_name` (optional)
- **Interview settings** — `interview_type`, `difficulty`
- **Resume context** — a short natural-language summary built by
  `resume_service.build_resume_summary()` from parsed resume fields
  (skills, experience, projects)
- **Conversation history** — `previous_questions` (to avoid repeats),
  and for follow-ups specifically, `last_question` + `last_answer`

## How follow-up questions work

1. After each answer, `evaluate_answer()` scores it and extracts
   `key_points` (short phrases worth probing further).
2. `next_question()` in `interview_routes.py` alternates: if the previous
   question was **not** already a follow-up, it calls
   `generate_follow_up_question()` with the literal text of the last
   question and answer; otherwise it starts a new topic with
   `generate_interview_question()`.
3. The follow-up prompt explicitly asks Gemini to reference "something
   concrete from their answer" — this is what produces questions like
   *"You mentioned pandas — how did you handle missing values?"*

## How evaluation works

`evaluate_answer()` asks Gemini to score five 0–100 dimensions
(technical, communication, problem-solving, relevance, confidence),
write 1–2 sentences of feedback, and list 2–4 `key_points`. The response
is parsed as strict JSON; a malformed or missing response falls back to a
deterministic demo evaluation so the interview never crashes.

## Error handling

`_call_gemini_json()` centralizes failure handling:

| Failure | Behavior |
|---|---|
| No API key configured | `DEMO_MODE = True` — every function returns a labeled demo response, `source: "demo"` |
| SDK/network error, timeout, rate limit | Caught, logged, falls back to the function-specific demo response |
| Non-JSON or malformed JSON response | Caught, logged, falls back |

Every response from `gemini_service.py` includes a `source` field
(`"gemini"` or `"demo"`) that the frontend surfaces as a badge — the UI
never silently presents demo output as if it were real Gemini output.

## Demo mode question bank

When in demo mode, `_DEMO_OPENERS` and `_DEMO_FOLLOWUPS` provide realistic
but clearly non-LLM-generated questions, and `evaluate_answer` computes a
length-based heuristic score. This keeps the entire product (UI, database,
ML pipeline, reports) fully testable without any API key.
