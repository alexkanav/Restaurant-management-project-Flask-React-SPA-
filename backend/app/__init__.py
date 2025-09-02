from flask import Flask

from .blueprints import register_blueprints
from .extensions import cache, db, limiter, jwt


def create_app(config_object='config.Config'):
    app = Flask(__name__, static_folder='../frontend', static_url_path='/')
    app.config.from_object(config_object)
    cache.init_app(app)
    limiter.init_app(app)
    db.init_app(app)
    register_blueprints(app)
    jwt.init_app(app)

    return app

