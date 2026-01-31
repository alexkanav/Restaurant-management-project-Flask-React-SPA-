from fastapi import APIRouter
from fastapi_app.api.routes import users, admin

api_router = APIRouter()
api_router.include_router(users.router, tags=["users"])
api_router.include_router(admin.router, tags=["admin"])
