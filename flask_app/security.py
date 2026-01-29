from flask import abort
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
import inspect

from utils.enums import UserRole


ROLE_ORDER = {
    UserRole.client: 1,
    UserRole.staff: 2,
    UserRole.admin: 3,
}

def has_role(required: UserRole) -> bool:
    """Check JWT role."""
    role = UserRole(get_jwt().get("role"))
    return ROLE_ORDER[role] >= ROLE_ORDER[required]


def role_required(required_role: UserRole = UserRole.client):
    def decorator(fn):
        sig = inspect.signature(fn)

        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            if not has_role(required_role):
                abort(403)

            if "user_id" in sig.parameters:
                kwargs["user_id"] = int(get_jwt_identity())

            return fn(*args, **kwargs)

        return wrapper
    return decorator

