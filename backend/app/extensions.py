from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.exc import SQLAlchemyError
import logging

from config import LOG_FILE_PATH


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

cache = Cache()

jwt = JWTManager()

limiter = Limiter(key_func=get_remote_address)

# Configure logging
logging.basicConfig(
    filename=LOG_FILE_PATH,
    level=logging.ERROR,
    format='%(asctime)s %(levelname)s: %(message)s\n'
)

logger = logging.getLogger(__name__)


def safe_commit():
    try:
        db.session.commit()
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("DB commit failed: %s", e, exc_info=True)
        return False
