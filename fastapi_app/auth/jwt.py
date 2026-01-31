from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError, ExpiredSignatureError
import logging

from fastapi_app.core.config import config
from domain.core.errors import NotFoundError, DomainValidationError
from domain.schemas import TokenPayload
from utils.enums import UserRole

logger = logging.getLogger(__name__)


def create_access_token(
        subject: str,
        role: UserRole,
        expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(timezone.utc) + (
            expires_delta or timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "sub": subject,
        "role": role.value if hasattr(role, "value") else role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        config.SECRET_KEY,
        algorithm=config.ALGORITHM,
    )


def decode_access_token(token: str) -> TokenPayload:
    try:
        payload_dict = jwt.decode(
            token,
            config.SECRET_KEY,
            algorithms=[config.ALGORITHM],
        )
    except ExpiredSignatureError:
        logger.info(f"Token_expired token={token}")
        raise DomainValidationError("Token expired")

    except JWTError:
        raise NotFoundError("Invalid token")

    return TokenPayload(**payload_dict)
