import pytest
from app import create_app
from app.extensions import db


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
    SECRET_KEY = 'test-key'
    CACHE_TYPE = 'SimpleCache'
    WTF_CSRF_ENABLED = False


@pytest.fixture
def app():
    app = create_app(config_object=TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()

