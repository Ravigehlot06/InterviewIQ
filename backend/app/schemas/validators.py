"""Lightweight request validation (kept dependency-free on purpose)."""
from app.utils.errors import ApiError


def require_fields(data: dict, fields: list[str]):
    missing = [f for f in fields if not data.get(f)]
    if missing:
        raise ApiError(f"Missing required field(s): {', '.join(missing)}.", 400, "validation_error")


def is_valid_email(email: str) -> bool:
    return "@" in email and "." in email.split("@")[-1]
