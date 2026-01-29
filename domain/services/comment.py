from sqlalchemy import select
from sqlalchemy.orm import Session

from domain.schemas import CommentSchema, CommentCreateSchema
from infrastructure.db.models.users import Comment


def get_comments(db: Session, limit: int) -> list[CommentSchema]:
    comments = db.scalars(select(Comment).order_by(Comment.id.desc()).limit(limit)).all()
    return [CommentSchema.model_validate(c) for c in comments]


def add_comment(db: Session, user_id: int, data: CommentCreateSchema) -> None:
    new_comment = Comment(
        user_id=user_id,
        user_name=data.user_name,
        comment_text=data.comment_text
    )
    db.add(new_comment)

