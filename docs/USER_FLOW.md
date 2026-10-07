# User Flow

```mermaid
flowchart TD
    A[Visitor lands on landing page] --> B{Has account?}
    B -- No --> C[Sign up: email/password or Google]
    B -- Yes --> D[Log in: email/password or Google]
    C --> E[Onboarding: profile, skills, optional resume]
    D --> F{Onboarding complete?}
    F -- No --> E
    F -- Yes --> G[Dashboard]
    E --> G

    G --> H[Interview setup wizard]
    H --> H1[Choose role]
    H1 --> H2[Optional: target company]
    H2 --> H3[Optional: select resume]
    H3 --> H4[Experience level]
    H4 --> H5[Difficulty]
    H5 --> H6[Interview type]
    H6 --> H7[Number of questions]
    H7 --> I[Start interview]

    I --> J[AI generates opening question]
    J --> K[User answers]
    K --> L[AI evaluates the answer]
    L --> M{More questions planned?}
    M -- Yes --> N[AI generates contextual follow-up or new topic]
    N --> K
    M -- No --> O[Interview marked completed]

    O --> P[AI aggregates feedback: strengths, areas to improve]
    P --> Q[ML model estimates Interview Readiness]
    Q --> R[Report saved: score, feedback, readiness]
    R --> S[Interview appears in History]
    S --> G
```

## Narrative walkthrough

1. **New user** discovers InterviewIQ via the landing page and clicks
   "Start your interview".
2. **Signup** via email/password or Google OAuth creates a `User` row and
   issues JWT access + refresh tokens.
3. **Onboarding** collects education, experience level, skills, and an
   optional resume upload — all steps except the account itself can be
   skipped and completed later from the Profile page.
4. **Resume** (if uploaded) is parsed into structured fields
   (skills, education, experience, projects, certifications) and stored;
   its summary is later injected into Gemini prompts for personalization.
5. **Interview setup** is a 7-screen sequential wizard rather than one
   long form: role → company (optional) → resume (optional) →
   experience → difficulty → type → question count.
6. **Interview** begins: the backend calls Gemini (or the demo fallback)
   for an opening question tailored to the chosen context. The user
   answers in a focused, distraction-free interview room.
7. **Follow-up**: after each answer is evaluated, the engine alternates
   between a contextual follow-up (referencing the candidate's own words)
   and a fresh topic, until the planned question count is reached.
8. **Evaluation**: every answer receives structured AI-generated scores
   (technical, communication, problem-solving, relevance, confidence).
9. **ML readiness**: on completion, aggregated scores are fed into the
   trained Random Forest model to produce an Interview Readiness Estimate.
10. **Report**: the final report combines the AI's qualitative feedback
    (strengths, areas to improve, summary) with the quantitative readiness
    estimate, and is permanently saved.
11. **History**: every past interview — in progress or completed — is
    listed, and clicking one reopens its report (or resumes it, if
    unfinished).
12. **Next practice**: the dashboard and report both point back to
    "Start new interview", closing the loop: discover → sign up →
    personalize → practice → adapt → evaluate → improve → repeat.
