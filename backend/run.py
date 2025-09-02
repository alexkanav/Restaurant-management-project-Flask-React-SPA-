from app import create_app
from flask_cors import CORS

from config import origin
from app.extensions import db


app = create_app()

CORS(app, supports_credentials=True, origins=[origin])

# create db
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=False)
