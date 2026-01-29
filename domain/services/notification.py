from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from domain.core.errors import NotFoundError
from infrastructure.db.models.admin import AdminNotification
from domain.schemas import NotificationSchema


def get_notifications(only_unread: bool, db: Session) -> list[NotificationSchema]:
    stmt = select(AdminNotification)

    if only_unread:
        stmt = stmt.where(AdminNotification.is_read.is_(False))

    stmt = stmt.order_by(AdminNotification.created_at.desc())
    notifications = db.scalars(stmt).all()

    return [NotificationSchema.model_validate(n) for n in notifications]


def count_unread_notifications(db: Session) -> int:
    return db.scalar(
        select(func.count()).select_from(AdminNotification).where(AdminNotification.is_read.is_(False))
    ) or 0


def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> None:
    notification = db.get(AdminNotification, notification_id)
    if not notification:
        raise NotFoundError(f"Сповіщення:{notification_id} не знайдено")

    if not notification.is_read:
        notification.is_read = True
        notification.read_staff_id = user_id
        notification.read_at = datetime.utcnow()
