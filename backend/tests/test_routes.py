from tests.auth_helpers import auth_headers


# users route
def test_get_current_user(client, app):
    headers = auth_headers(app, user_id=123)

    response = client.get("/api/users/me", headers=headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 123


# admin route
def test_get_order_count(client, app):
    headers = auth_headers(app, user_id=1, role="staff")
    response = client.get("/admin/api/orders/count", headers=headers)

    assert response.status_code == 200
    assert "order_number" in response.get_json()