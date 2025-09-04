from app.blueprints.admin.models import Staff
from app.extensions import db
from flask_jwt_extended import create_access_token
from tests.auth_helpers import auth_headers


def test_check_session_success(client, app):
    with app.app_context():
        staff = Staff(username="test_user", email="test@test", password_hash="12345")
        db.session.add(staff)
        db.session.commit()

    headers = auth_headers(app, user_id=1, role="staff")
    response = client.get("/admin/api/auth/session", headers=headers)

    assert response.status_code == 200
    assert response.get_json()["username"] == 1


def test_check_session_forbidden_for_non_staff(client, app):
    headers = auth_headers(app, user_id=2, role="client")  # not staff
    response = client.get("/admin/api/auth/session", headers=headers)

    assert response.status_code == 403
    assert "Access Forbidden" in response.get_json()["message"]


def test_check_session_missing_user_id(client, app):
    with app.app_context():
        token = create_access_token(identity="2", additional_claims={"role": "staff"})  # no "id"
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/admin/api/auth/session", headers=headers)

    assert response.status_code == 400
    assert "missing user ID" in response.get_json()["message"]


def test_check_session_user_not_found(client, app):
    headers = auth_headers(app, user_id=999, role="staff")  # ID does not exist
    response = client.get("/admin/api/auth/session", headers=headers)

    assert response.status_code == 404
    assert "User not found" in response.get_json()["message"]
