def test_get_comments(client, app):
    # Seed a comment into the test database
    from app.blueprints.users.models import Comment
    from app.extensions import db

    with app.app_context():
        comment = Comment(
            user_id=0,
            user_name="Test User",
            comment_date_time="01-01-2024",
            comment_text="This is a test comment."
        )
        db.session.add(comment)
        db.session.commit()

    # Call the endpoint
    response = client.get('/api/get-comments')

    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

    # Check structure of a single comment
    comment = data[0]
    assert "id" in comment
    assert "name" in comment
    assert "time" in comment
    assert "message" in comment


def test_send_comment(client, app):
    from app.blueprints.users.models import Comment
    from tests.auth_helpers import auth_headers

    headers = auth_headers(app, user_id=1)
    payload = {
        "name": "Tester",
        "message": "Testing comment send"
    }

    response = client.post('/api/send-comment', json=payload, headers=headers)
    assert response.status_code == 201

    with app.app_context():
        comment = Comment.query.filter_by(comment_text="Testing comment send").first()
        assert comment is not None
