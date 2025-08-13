from flask import Flask
import os
from dotenv import load_dotenv

from .blueprints import register_blueprints
from .extensions import cache, db, login_manager, limiter


# Load variables from .env into environment
load_dotenv()


def create_app(config_object='config.DatabaseConfig'):
    app = Flask(__name__, static_folder='../frontend', static_url_path='/')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-dev-key')
    app.config.from_object(config_object)
    app.config['CACHE_TYPE'] = 'SimpleCache'
    cache.init_app(app)
    limiter.init_app(app)
    db.init_app(app)
    register_blueprints(app)
    login_manager.init_app(app)

    return app



