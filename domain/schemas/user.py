from pydantic import BaseModel

from utils.enums import UserRole


class UserResponseSchema(BaseModel):
    user_id: int


class CurrentUserSchema(BaseModel):
    id: int
    role: UserRole


class DiscountSchema(BaseModel):
    discount: int


class UserSchema(BaseModel):
    id: int
    name: str

