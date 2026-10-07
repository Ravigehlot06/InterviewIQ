# Authentication

## Overview

InterviewIQ supports two ways to sign in, both ultimately issuing the
same JWT token pair:

1. **Email/password** — `POST /api/auth/register`, `POST /api/auth/login`
2. **Google OAuth 2.0** — `GET /api/auth/google` → Google consent screen
   → `GET /api/auth/google/callback`

## Password security

- Passwords are never stored in plain text. `User.set_password()` uses
  Werkzeug's `generate_password_hash` (PBKDF2-SHA256 by default), and
  `check_password()` uses `check_password_hash` for constant-time
  comparison.
- Minimum password length (8 characters) is enforced server-side at
  registration.
- Google-only accounts have `password_hash = NULL` — they can never be
  logged into via the password endpoint.

## JWT tokens

- **Access token**: short-lived (`JWT_ACCESS_TOKEN_EXPIRES_MINUTES`,
  default 60 minutes), sent as `Authorization: Bearer <token>` on every
  authenticated request.
- **Refresh token**: longer-lived (`JWT_REFRESH_TOKEN_EXPIRES_DAYS`,
  default 7 days), issued alongside the access token. (The current
  implementation issues both at login/register; a dedicated
  `/auth/refresh` endpoint can be added when silent token renewal is
  prioritized — until then, an expired access token requires logging in
  again, which the frontend handles automatically by redirecting to
  `/login`.)
- Tokens are signed with `JWT_SECRET_KEY` (HS256), kept separate from
  Flask's general `SECRET_KEY` so it can be rotated independently.
- `app/middleware/auth_middleware.py`'s `require_auth` decorator validates
  the token on every protected route, distinguishes expired vs. invalid
  tokens (`token_expired` vs `invalid_token` error codes), and loads the
  corresponding `User` into `request.current_user`.

## Google OAuth flow

1. Frontend links to `GET /api/auth/google`.
2. Backend redirects to Google's OAuth consent screen with
   `GOOGLE_CLIENT_ID` and `GOOGLE_REDIRECT_URI`.
3. Google redirects back to `GET /api/auth/google/callback?code=...`.
4. Backend exchanges the code for a Google access token, fetches the
   user's profile (`sub`, `email`, `name`), and either links to an
   existing account (by `google_id` or matching `email`) or creates a new
   `User` with `auth_provider="google"`.
5. Backend issues InterviewIQ's own JWT tokens and redirects to
   `FRONTEND_URL/auth/callback?access_token=...&refresh_token=...`.
6. The frontend's `AuthCallback` page reads the tokens from the URL,
   calls `GET /auth/me` to confirm they're valid, stores them, and routes
   the user to onboarding or the dashboard.

If `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` are not configured, both
endpoints return a `503 google_oauth_not_configured` error with a clear
message instead of crashing — email/password auth is unaffected.

## Protected routes & authorization

- Every route that touches user-specific data uses `@require_auth`.
- Ownership is checked explicitly wherever a resource is fetched by ID —
  e.g. `Interview.query.filter_by(id=interview_id, user_id=user.id)` —
  so one user can never read, modify, or delete another user's
  interviews, resumes, or reports (`404 not_found` is returned rather
  than `403`, to avoid confirming a resource's existence to a
  non-owner).

## Session persistence (frontend)

- Tokens and the current user object are stored in `localStorage` under
  `iq_access_token`, `iq_refresh_token`, `iq_user`.
- `AuthContext` re-validates the stored token against `GET /auth/me` on
  app load; an invalid/expired token clears the session and the user is
  treated as logged out.
- Axios response interceptor (`services/api.js`) automatically clears the
  session and redirects to `/login` on any `401` with an auth-related
  error code.

## Duplicate email & error handling

- Registering with an email that already exists returns
  `409 email_exists` with a clear message — no ambiguity about whether an
  account exists (acceptable here since email uniqueness isn't a
  sensitive signal for this product).
- Invalid login credentials return a generic `401 invalid_credentials`
  message (does not reveal whether the email exists or the password was
  wrong).
