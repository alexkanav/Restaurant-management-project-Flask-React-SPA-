from .users.routes import users_bp
from .admin.routes import admin_bp


def register_blueprints(app):
    app.register_blueprint(users_bp)
    app.register_blueprint(admin_bp)



