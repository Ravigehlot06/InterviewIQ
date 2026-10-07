"""
auth_routes.py
--------------
Email/password auth + Google OAuth (authorization-code flow).

Google OAuth notes:
- Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI.
- If not configured, /api/auth/google returns a clear configuration error
  instead of crashing, so the rest of the app remains testable.
"""
import os
import logging
from urllib.parse import urlencode
import requests as http
from flask import Blueprint, request, jsonify, redirect

from app.extensions import db
from app.models.user import User
from app.utils.jwt_utils import generate_access_token, generate_refresh_token
from app.utils.errors import ApiError
from app.middleware.auth_middleware import require_auth
from app.schemas.validators import require_fields, is_valid_email

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def _get_google_config():
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "").strip()
    return client_id, client_secret, redirect_uri


def _issue_tokens(user: User):
    return {
        "access_token": generate_access_token(user.id),
        "refresh_token": generate_refresh_token(user.id),
        "user": user.to_dict(),
    }


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    require_fields(data, ["email", "password", "full_name"])
    email = data["email"].strip().lower()
    if not is_valid_email(email):
        raise ApiError("Please enter a valid email address.", 400, "validation_error")
    if len(data["password"]) < 8:
        raise ApiError("Password must be at least 8 characters long.", 400, "validation_error")

    if User.query.filter_by(email=email).first():
        raise ApiError("An account with this email already exists.", 409, "email_exists")

    user = User(email=email, full_name=data["full_name"].strip(), auth_provider="email")
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    return jsonify(_issue_tokens(user)), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    require_fields(data, ["email", "password"])
    email = data["email"].strip().lower()

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(data["password"]):
        raise ApiError("Invalid email or password.", 401, "invalid_credentials")
    if not user.is_active:
        raise ApiError("This account has been deactivated.", 403, "account_inactive")

    return jsonify(_issue_tokens(user))


@auth_bp.get("/me")
@require_auth
def me():
    return jsonify(request.current_user.to_dict())


@auth_bp.post("/logout")
@require_auth
def logout():
    # Stateless JWTs: logout is handled client-side by discarding tokens.
    # Included for a complete, explicit API contract expected by the frontend.
    return jsonify({"message": "Logged out."})


@auth_bp.get("/google")
def google_login_redirect():
    client_id, client_secret, redirect_uri = _get_google_config()
    if not (client_id and redirect_uri):
        logger.warning("Google login attempted but credentials are missing in backend/.env")
        raise ApiError(
            "Google login is not configured on this server. Set GOOGLE_CLIENT_ID, "
            "GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in backend/.env.",
            503, "google_oauth_not_configured",
        )
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
    }
    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    logger.info("Redirecting to Google OAuth: client_id=%s..., redirect_uri=%s", client_id[:12], redirect_uri)
    return redirect(auth_url)


@auth_bp.get("/google/callback")
def google_callback():
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    client_id, client_secret, redirect_uri = _get_google_config()

    if not (client_id and client_secret and redirect_uri):
        logger.error("Google callback reached without credentials configured.")
        raise ApiError("Google login is not configured on this server.", 503, "google_oauth_not_configured")

    code = request.args.get("code")
    err = request.args.get("error")
    if err:
        logger.warning("Google returned error in OAuth callback: %s", err)
        return redirect(f"{frontend_url}/login?error=google_auth_{err}")

    if not code:
        logger.warning("Google callback invoked without authorization code.")
        return redirect(f"{frontend_url}/login?error=google_auth_failed")

    try:
        token_resp = http.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }, timeout=15)
    except Exception as exc:
        logger.exception("Failed to connect to Google token endpoint: %s", exc)
        return redirect(f"{frontend_url}/login?error=google_token_connection_failed")

    if token_resp.status_code != 200:
        logger.error("Google token exchange failed: status=%s body=%s", token_resp.status_code, token_resp.text)
        return redirect(f"{frontend_url}/login?error=google_token_exchange_failed")

    access_token = token_resp.json().get("access_token")
    try:
        userinfo_resp = http.get(
            GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"}, timeout=15
        )
    except Exception as exc:
        logger.exception("Failed to connect to Google userinfo endpoint: %s", exc)
        return redirect(f"{frontend_url}/login?error=google_userinfo_connection_failed")

    if userinfo_resp.status_code != 200:
        logger.error("Google userinfo failed: status=%s body=%s", userinfo_resp.status_code, userinfo_resp.text)
        return redirect(f"{frontend_url}/login?error=google_userinfo_failed")

    profile = userinfo_resp.json()
    google_id = profile.get("sub")
    email = (profile.get("email") or "").lower()
    full_name = profile.get("name") or email.split("@")[0]

    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
        else:
            user = User(email=email, full_name=full_name, auth_provider="google", google_id=google_id)
            db.session.add(user)
    db.session.commit()

    tokens = _issue_tokens(user)
    return redirect(
        f"{frontend_url}/auth/callback?access_token={tokens['access_token']}"
        f"&refresh_token={tokens['refresh_token']}"
    )
