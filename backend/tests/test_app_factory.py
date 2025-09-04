def test_app_creation(app):
    assert app is not None
    assert app.config['TESTING'] is True
    assert app.config['SECRET_KEY'] == 'test-key'


def test_extensions_initialized(app):
    from app.extensions import db, cache, jwt, limiter
    assert db is not None
    assert cache is not None
    assert jwt is not None
    assert limiter is not None









