from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_serializer

from utils.enums import NotificationType


class NotificationSchema(BaseModel):
    id: int
    title: str
    created_staff_id: int | None
    message: str
    type: NotificationType
    created_at: datetime

    @field_serializer("created_at")
    def format_date(self, value: datetime):
        return value.strftime("%d-%m-%Y %H:%M")

    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True
    )


class NotificationCreateSchema(BaseModel):
    title: str
    message: str
    notif_type: NotificationType = NotificationType.info
    created_staff_id: int | None = None


class NotificationCountResponseSchema(BaseModel):
    unread_notif_count: int