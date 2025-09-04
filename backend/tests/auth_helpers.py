from flask_jwt_extended import create_access_token

def auth_headers(app, user_id=1, role="client"):
    with app.app_context():
        access_token = create_access_token(
            identity=str(user_id),
            additional_claims={"id": user_id, "role": role}
        )
    return {"Authorization": f"Bearer {access_token}"}

