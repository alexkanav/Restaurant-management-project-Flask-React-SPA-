from pydantic import BaseModel


class MessageResponseSchema(BaseModel):
    message: str

class ImageResponseSchema(BaseModel):
    filename: str