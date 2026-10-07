"""Centralized API error handling.

Ensures the frontend always receives a consistent JSON error shape:
{ "error": { "code": "...", "message": "..." } } and that raw stack
traces / secrets are never leaked to the client.
"""
import logging
from flask import jsonify
from werkzeug.exceptions import HTTPException

logger = logging.getLogger("interviewiq")


class ApiError(Exception):
    """Raised deliberately by application code for a known error case."""

    def __init__(self, message: str, status_code: int = 400, code: str = "bad_request"):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code


def _error_response(code: str, message: str, status: int):
    return jsonify({"error": {"code": code, "message": message}}), status


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err: ApiError):
        return _error_response(err.code, err.message, err.status_code)

    @app.errorhandler(HTTPException)
    def handle_http_exception(err: HTTPException):
        return _error_response(err.name.lower().replace(" ", "_"), err.description, err.code)

    @app.errorhandler(Exception)
    def handle_uncaught(err: Exception):
        logger.exception("Unhandled exception")
        return _error_response("internal_error", "Something went wrong. Please try again.", 500)
