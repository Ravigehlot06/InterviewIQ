"""
gemini_service.py
------------------
Dedicated Generative AI service. Routes never talk to Gemini directly -
they always go through the functions defined here.

DEMO MODE:
If GEMINI_API_KEY is not set or unavailable, every function below falls back to a
clearly-labeled deterministic mock so the rest of the product (UI, DB,
ML, reports) remains fully testable without a real API key. Demo output
is tagged with source="demo" so the frontend can show a "Demo Mode"
badge instead of silently pretending it's a real Gemini response.
"""
import os
import json
import logging
import random
import re
from dotenv import load_dotenv

# Ensure environment is loaded
load_dotenv()

logger = logging.getLogger("interviewiq.gemini")

SYSTEM_PROMPT = """You are a professional, experienced technical/HR interviewer \
conducting a realistic mock interview.

Rules you must always follow:
- Ask realistic, role-appropriate interview questions.
- Never reveal correct answers except when explicitly asked to evaluate.
- Never repeat a question already asked in this interview.
- Use the candidate's resume/profile context naturally, only when relevant.
- Ask contextual follow-up questions that reference specifics the candidate \
  actually said.
- Adjust difficulty to the requested level.
- Remain professional, encouraging and respectful at all times.
- Never ask discriminatory, illegal, or personal questions (age, marital \
  status, religion, disability, etc).
- When asked for structured output, return ONLY valid JSON, no prose, no \
  markdown fences.
"""

_client = None


def _get_client():
    global _client
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    if _client is None:
        try:
            from google import genai
            _client = genai.Client(api_key=key)
            logger.info("Gemini client successfully initialized.")
        except Exception as exc:
            logger.warning("Gemini SDK could not be initialized, falling back to demo mode: %s", exc)
            _client = None
    return _client


# Keep DEMO_MODE variable and property
@property
def _demo_mode_active():
    return _get_client() is None


DEMO_MODE = _get_client() is None


def is_demo_mode() -> bool:
    return _get_client() is None


def _get_candidate_models() -> list[str]:
    primary = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite").strip() or "gemini-3.1-flash-lite"
    fallbacks = [
        primary,
        "gemini-3.1-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-flash-lite-latest",
        "gemini-3.8-flash",
    ]
    seen = set()
    models = []
    for m in fallbacks:
        if m and m not in seen:
            seen.add(m)
            models.append(m)
    return models


def _clean_json_text(text: str) -> str:
    """Extracts JSON substring cleanly even if enclosed in markdown code fences or conversational text."""
    text = (text or "").strip()
    text = re.sub(r"^```(?:json)?", "", text, flags=re.MULTILINE).strip()
    text = re.sub(r"```$", "", text, flags=re.MULTILINE).strip()

    # Find outermost { ... }
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return text[first_brace : last_brace + 1]
    return text


def _call_gemini_json(prompt: str, fallback: dict) -> dict:
    """Calls Gemini expecting a JSON object back; validates and falls back
    to a safe default structure on any error."""
    client = _get_client()
    if not client:
        return fallback

    for model_name in _get_candidate_models():
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=f"{SYSTEM_PROMPT}\n\n{prompt}",
            )
            raw_text = response.text or ""
            cleaned = _clean_json_text(raw_text)
            data = json.loads(cleaned)
            data["source"] = "gemini"
            return data
        except json.JSONDecodeError as jde:
            logger.warning("Gemini model %s returned invalid JSON (%s), raw output: %.120s", model_name, jde, raw_text)
            continue
        except Exception as exc:
            logger.warning("Gemini model %s call failed (%s), trying next candidate if available.", model_name, exc)
            continue

    logger.error("All Gemini model attempts failed; using demo fallback.")
    return fallback


# ---------------------------------------------------------------------------
# Demo question bank (used only when GEMINI_API_KEY is not configured)
# ---------------------------------------------------------------------------
_DEMO_OPENERS = {
    "technical": [
        "Tell me about a recent project where you had to solve a challenging technical problem.",
        "Walk me through how you would design a URL shortening service.",
        "What data structure would you use to implement an LRU cache, and why?",
    ],
    "hr": [
        "Tell me a little about yourself and what draws you to this role.",
        "Describe a time you disagreed with a teammate. How did you handle it?",
        "Where do you see yourself professionally in the next two years?",
    ],
    "role_based": [
        "What excites you most about working as a {role}?",
        "Which tools or frameworks do you rely on most as a {role}, and why?",
    ],
    "company": [
        "Why are you interested in practicing for a role at {company}?",
        "How would you approach your first 90 days in a {role} role at {company}?",
    ],
}

_DEMO_FOLLOWUPS = [
    "You mentioned {topic}. Can you go a level deeper into how you approached that?",
    "Interesting - what trade-offs did you consider when you {topic}?",
    "What would you do differently if the scale of that problem grew 10x?",
    "How did you validate that {topic} actually worked as intended?",
]


def _extract_topic(answer_text: str) -> str:
    words = [w.strip(".,!?") for w in answer_text.split() if len(w) > 4]
    return random.choice(words) if words else "that approach"


def generate_interview_question(context: dict) -> dict:
    """Generates the opening (non-follow-up) question for a given interview
    context. Returns {"question": str, "question_type": str, "source": str}.
    """
    role_name = context.get("role_name", "the role")
    company_name = context.get("company_name")
    interview_type = context.get("interview_type", "hr")
    difficulty = context.get("difficulty", "medium")
    resume_summary = context.get("resume_summary", "")
    previous_questions = context.get("previous_questions", [])

    fallback_bank = _DEMO_OPENERS.get(interview_type, _DEMO_OPENERS["hr"])
    fallback_q = random.choice(fallback_bank).format(role=role_name, company=company_name or "this company")
    fallback = {"question": fallback_q, "question_type": interview_type, "source": "demo"}

    if is_demo_mode():
        return fallback

    prompt = f"""
Generate the OPENING interview question for this mock interview.

Role: {role_name}
Target company (if any): {company_name or "None specified"}
Interview type: {interview_type}
Difficulty: {difficulty}
Candidate resume summary: {resume_summary or "Not provided"}
Questions already asked: {previous_questions or "None"}

Return JSON exactly like:
{{"question": "...", "question_type": "{interview_type}"}}
"""
    return _call_gemini_json(prompt, fallback)


def generate_follow_up_question(context: dict) -> dict:
    """Generates a contextual follow-up based on the candidate's last answer."""
    last_question = context.get("last_question", "")
    last_answer = context.get("last_answer", "")
    role_name = context.get("role_name", "the role")
    difficulty = context.get("difficulty", "medium")
    previous_questions = context.get("previous_questions", [])

    topic = _extract_topic(last_answer)
    fallback_q = random.choice(_DEMO_FOLLOWUPS).format(topic=topic)
    fallback = {"question": fallback_q, "question_type": "follow_up", "source": "demo"}

    if is_demo_mode():
        return fallback

    prompt = f"""
The candidate for role "{role_name}" was just asked:
"{last_question}"

They answered:
"{last_answer}"

Generate ONE natural, specific follow-up question that references something
concrete from their answer. Difficulty: {difficulty}.
Questions already asked: {previous_questions or "None"}

Return JSON exactly like:
{{"question": "...", "question_type": "follow_up"}}
"""
    return _call_gemini_json(prompt, fallback)


def evaluate_answer(context: dict) -> dict:
    """Evaluates a single answer. Returns structured scores (0-100) + feedback."""
    question = context.get("question", "")
    answer = context.get("answer", "")

    if not answer.strip():
        return {
            "technical_score": 0,
            "communication_score": 0,
            "problem_solving_score": 0,
            "relevance_score": 0,
            "confidence_score": 0,
            "feedback": "No answer was provided for this question.",
            "key_points": [],
            "source": "demo",
        }

    length_score = min(100, 40 + len(answer.split()) * 2)
    fallback = {
        "technical_score": round(length_score * random.uniform(0.75, 1.0), 1),
        "communication_score": round(length_score * random.uniform(0.8, 1.0), 1),
        "problem_solving_score": round(length_score * random.uniform(0.7, 0.95), 1),
        "relevance_score": round(length_score * random.uniform(0.75, 1.0), 1),
        "confidence_score": round(length_score * random.uniform(0.7, 1.0), 1),
        "feedback": "Demo-mode evaluation: your answer covered a reasonable amount of "
                    "detail. Consider structuring it with a clear situation, action, "
                    "and result.",
        "key_points": answer.split()[:3],
        "source": "demo",
    }

    if is_demo_mode():
        return fallback

    prompt = f"""
Evaluate this interview answer as a strict but fair interviewer.

Question: {question}
Answer: {answer}

Score each from 0-100: technical_score, communication_score,
problem_solving_score, relevance_score, confidence_score.
Give 1-2 sentences of constructive feedback.
List 2-4 key_points (short phrases) from the answer that could be probed
further in a follow-up question.

Return JSON exactly like:
{{"technical_score": 0, "communication_score": 0, "problem_solving_score": 0,
"relevance_score": 0, "confidence_score": 0, "feedback": "...",
"key_points": ["...", "..."]}}
"""
    return _call_gemini_json(prompt, fallback)


def generate_final_feedback(context: dict) -> dict:
    """Aggregates per-answer evaluations into overall strengths/weaknesses."""
    evaluations = context.get("evaluations", [])
    role_name = context.get("role_name", "the role")

    if not evaluations:
        fallback = {
            "strengths": ["Completed the practice session"],
            "areas_to_improve": ["Answer more questions for deeper feedback"],
            "ai_feedback_summary": "Not enough answers were recorded to generate detailed feedback.",
            "recommended_practice_areas": [role_name],
            "source": "demo",
        }
        return fallback

    avg = lambda key: sum(e.get(key, 0) or 0 for e in evaluations) / len(evaluations)
    technical = avg("technical_score")
    comms = avg("communication_score")
    ps = avg("problem_solving_score")

    strengths, weaknesses = [], []
    (strengths if technical >= 65 else weaknesses).append("Technical depth")
    (strengths if comms >= 65 else weaknesses).append("Communication clarity")
    (strengths if ps >= 65 else weaknesses).append("Problem-solving approach")
    if not strengths:
        strengths.append("Willingness to attempt every question")
    if not weaknesses:
        weaknesses.append("Fine-tuning answer structure (STAR method)")

    fallback = {
        "strengths": strengths,
        "areas_to_improve": weaknesses,
        "ai_feedback_summary": (
            f"Demo-mode summary: across {len(evaluations)} answers, your average "
            f"technical score was {technical:.0f}, communication {comms:.0f}, and "
            f"problem solving {ps:.0f}. Focus practice on your weaker areas above."
        ),
        "recommended_practice_areas": weaknesses,
        "source": "demo",
    }

    if is_demo_mode():
        return fallback

    prompt = f"""
Here are per-answer evaluation scores (0-100) for a {role_name} mock interview:
{json.dumps(evaluations)}

Summarize into:
- strengths (2-3 short phrases)
- areas_to_improve (2-3 short phrases)
- ai_feedback_summary (3-4 sentences, encouraging but honest)
- recommended_practice_areas (1-3 short phrases)

Return JSON exactly like:
{{"strengths": ["..."], "areas_to_improve": ["..."],
"ai_feedback_summary": "...", "recommended_practice_areas": ["..."]}}
"""
    return _call_gemini_json(prompt, fallback)


def generate_interview_summary(context: dict) -> str:
    """One-paragraph plain-text summary used in history/report headers."""
    role_name = context.get("role_name", "the role")
    overall_score = context.get("overall_score", 0)
    if is_demo_mode():
        return (
            f"Demo-mode summary: This {role_name} practice interview finished with "
            f"an overall score of {overall_score:.0f}%. Keep practicing to build "
            f"consistency across all evaluation areas."
        )
    prompt = (
        f"Write one encouraging paragraph (3-4 sentences) summarizing a mock "
        f"interview for {role_name} with overall score {overall_score}. "
        f"Return plain text only, no JSON."
    )
    client = _get_client()
    if not client:
        return f"This {role_name} practice interview finished with an overall score of {overall_score:.0f}%."

    for model_name in _get_candidate_models():
        try:
            response = client.models.generate_content(model=model_name, contents=f"{SYSTEM_PROMPT}\n\n{prompt}")
            if response.text and response.text.strip():
                return response.text.strip()
        except Exception as exc:
            logger.warning("Gemini summary call failed with model %s (%s)", model_name, exc)
            continue

    return f"This {role_name} practice interview finished with an overall score of {overall_score:.0f}%."
