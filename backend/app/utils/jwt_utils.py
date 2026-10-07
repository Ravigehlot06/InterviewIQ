"""JWT encode/decode helpers.

Access tokens are short-lived; refresh tokens are longer-lived. Both are
signed with JWT_SECRET_KEY (kept separate from Flask's SECRET_KEY so it can
be rotated independently).
"""
import datetime
import jwt
from flask import current_app


def _now():
    return datetime.datetime.now(datetime.timezone.utc)


def generate_access_token(user_id: str) -> str:
    minutes = current_app.config["JWT_ACCESS_TOKEN_EXPIRES_MINUTES"]
    payload = {
        "sub": user_id,
        "type": "access",
        "iat": _now(),
        "exp": _now() + datetime.timedelta(minutes=minutes),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def generate_refresh_token(user_id: str) -> str:
    days = current_app.config["JWT_REFRESH_TOKEN_EXPIRES_DAYS"]
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": _now(),
        "exp": _now() + datetime.timedelta(days=days),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    """Raises jwt.PyJWTError subclasses on invalid/expired tokens."""
    return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
