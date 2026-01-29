from flask import Flask, g
import logging
from logging.handlers import RotatingFileHandler

from flask_app.blueprints import register_blueprints
from flask_app.extensions import cache, limiter, jwt
from infrastructure.db.engine import engine, SessionLocal
from infrastructure.db.base import Base
from flask_app.config import Config
from domain.core.settings import settings

settings.LOG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
file_handler = RotatingFileHandler(
    settings.LOG_FILE_PATH,
    maxBytes=10 * 1024 * 1024,  # 10 MB
    backupCount=5,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[
        file_handler,
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)


def create_app(base_config='domain.core.settings.Settings', auth_config='flask_app.config.Config'):
    app = Flask(__name__, static_folder='../frontend', static_url_path='/')
    app.config.from_object(base_config)
    app.config.from_object(auth_config)
    cache.init_app(app)
    limiter.init_app(app)
    jwt.init_app(app)
    register_blueprints(app)

    # Create database tables
    # Base.metadata.create_all(bind=engine)

    @app.before_request
    def create_session():
        g.db = SessionLocal()
        g.db.rollback_needed = False

    @app.teardown_request
    def remove_session(exc=None):
        db = getattr(g, "db", None)
        if db is None:
            return

        try:
            if exc is not None or getattr(db, "rollback_needed", False):
                db.rollback()
            else:
                db.commit()
        except Exception:
            db.rollback()
            logger.exception("Session_cleanup_failed")
        finally:
            db.close()

    return app
