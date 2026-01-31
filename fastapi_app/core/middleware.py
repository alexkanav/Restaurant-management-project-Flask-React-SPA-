from fastapi.middleware.cors import CORSMiddleware

from domain.core.settings import settings


def setup_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
