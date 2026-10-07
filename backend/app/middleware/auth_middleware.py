"""Authentication middleware.

`require_auth` protects a route: it expects `Authorization: Bearer <token>`,
validates the JWT, loads the user, and injects it as `request.current_user`.
"""
import functools
import jwt
from flask import request

from app.utils.jwt_utils import decode_token
from app.utils.errors import ApiError
from app.models.user import User


def require_auth(view_func):
    @functools.wraps(view_func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise ApiError("Missing or invalid Authorization header.", 401, "unauthorized")

        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            raise ApiError("Session expired. Please log in again.", 401, "token_expired")
        except jwt.PyJWTError:
            raise ApiError("Invalid authentication token.", 401, "invalid_token")

        if payload.get("type") != "access":
            raise ApiError("Invalid token type.", 401, "invalid_token")

        user = User.query.get(payload.get("sub"))
        if not user or not user.is_active:
            raise ApiError("User not found or inactive.", 401, "unauthorized")

        request.current_user = user
        return view_func(*args, **kwargs)

    return wrapper
