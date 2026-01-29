from datetime import datetime
from pydantic import BaseModel, ConfigDict, computed_field


class CommentSchema(BaseModel):
    id: int
    user_name: str
    comment_date_time: datetime
    comment_text: str

    @computed_field
    @property
    def comment_date(self) -> str:
        return self.comment_date_time.strftime("%d-%m-%Y")

    model_config = ConfigDict(from_attributes=True)


class CommentCreateSchema(BaseModel):
    user_name: str
    comment_text: str

class CommentResponseSchema(BaseModel):
    comments: list[CommentSchema]