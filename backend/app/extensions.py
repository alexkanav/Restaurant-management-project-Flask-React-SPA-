from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.exc import SQLAlchemyError
import logging

from config import log_file_path


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

cache = Cache()

login_manager = LoginManager()

limiter = Limiter(key_func=get_remote_address)

# Configure logging
logging.basicConfig(
    filename=log_file_path,
    level=logging.ERROR,  # Log only errors and above
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
