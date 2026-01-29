from flask_cors import CORS

from flask_app import create_app
from domain.core.settings import settings


app = create_app()

CORS(app, supports_credentials=True, origins=settings.CORS_ORIGINS)


if __name__ == '__main__':
    app.run(debug=False)
