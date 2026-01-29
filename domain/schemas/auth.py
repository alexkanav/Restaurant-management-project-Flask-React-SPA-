from datetime import datetime
from pydantic import BaseModel

from utils.enums import UserRole


class TokenPayload(BaseModel):
    sub: str
    role: UserRole
    exp: datetime | None = None


class RegisterRequestSchema(BaseModel):
    username: str
    email: str
    password: str


class LoginRequestSchema(BaseModel):
    email: str
    password: str
