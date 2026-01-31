import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend
import redis.asyncio as redis
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
import logging
from logging.handlers import RotatingFileHandler

from fastapi_app.core.middleware import setup_middleware
from fastapi_app.api.router import api_router
from domain.core.settings import settings
from fastapi_app.core.limiter import limiter

settings.LOG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
file_handler = RotatingFileHandler(
    settings.LOG_FILE_PATH,
    maxBytes=10 * 1024 * 1024,  # 10 MB
    backupCount=5,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[
        file_handler,
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_client = None

    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
        await asyncio.wait_for(redis_client.ping(), timeout=1)

        FastAPICache.init(
            RedisBackend(redis_client),
            prefix="fastapi-cache",
        )
        logger.info("FastAPI_cache_initialized_with_Redis")

        app.state.redis = redis_client

    except Exception:
        FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
        logger.warning("Redis_unavailable", exc_info=True)

    yield

    if redis_client:
        await redis_client.close()
        logger.info("Redis_connection_closed")


app = FastAPI(lifespan=lifespan)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests"},
    )


setup_middleware(app)

app.include_router(api_router, prefix="/api")
