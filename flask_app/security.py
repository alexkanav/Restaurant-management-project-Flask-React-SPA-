from flask import abort
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from sqlalchemy.orm import Session
import inspect
import logging

from domain.core.constants import ROLE_ORDER
from utils.enums import UserRole
from domain.services.user import user_exists_for_role

logger = logging.getLogger(__name__)


def has_required_role(required: UserRole) -> bool:
    """Check JWT role."""
    try:
        role_value = get_jwt().get("role")
        if not role_value:
            logger.warning("Missing role claim in JWT")
            return False
        role = UserRole(role_value)
    except (ValueError, TypeError):
        logger.warning("Invalid or missing role claim in JWT", exc_info=True)
        return False
    return ROLE_ORDER.get(role, 0) >= ROLE_ORDER[required]


def role_required(required_role: UserRole = UserRole.client):
    def decorator(fn):
        sig = inspect.signature(fn)

        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            if not has_required_role(required_role):
                abort(403)

            if "user_id" in sig.parameters:
                kwargs["user_id"] = int(get_jwt_identity())

            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_active_staff(db: Session) -> int:
    user_id = int(get_jwt_identity())
    if not has_required_role(UserRole.staff) or not user_exists_for_role(db, user_id, UserRole.staff):
        abort(403)

    return user_id
