from pydantic import BaseModel


class ErrorResponseSchema(BaseModel):
    detail: str

class RateLimitErrorSchema(BaseModel):
    detail: str
    retry_after: int  # seconds until user can retry