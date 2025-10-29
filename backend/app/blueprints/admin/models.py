from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Enum, DateTime
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db, safe_commit, logger
from app.utils import NotificationType


class Staff(db.Model):
    __tablename__ = 'staff'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(db.String(200))
    email: Mapped[str] = mapped_column(db.String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(db.String(100))

    notifications: Mapped[list["AdminNotification"]] = relationship(back_populates="staff")

    def __repr__(self):
        return f"<Staff {self.id}>"

    @property
    def password(self):
        raise AttributeError("Password is write-only.")

    @password.setter
    def password(self, plain_password: str):
        self.password_hash = generate_password_hash(plain_password, method='pbkdf2:sha256')

    def check_password(self, password_input: str) -> bool:
        return check_password_hash(self.password_hash, password_input)

    @classmethod
    def add_user(cls, name: str, email: str, password: str):
        new_user = cls(username=name, email=email)
        new_user.password = password
        db.session.add(new_user)
        if not safe_commit():
            logger.error("Could not add staff.")
            return False
        return True


class AdminNotification(db.Model):
    __tablename__ = "admin_notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    staff_id: Mapped[int | None] = mapped_column(ForeignKey("staff.id"), nullable=True)
    title: Mapped[str] = mapped_column(db.String(50))
    message: Mapped[str] = mapped_column(db.String(300))
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType), default=NotificationType.info
    )
    is_read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    staff: Mapped["Staff"] = relationship(back_populates="notifications")

    def __repr__(self):
        return f"<AdminNotification {self.id} title={self.title!r}>"

    @classmethod
    def add_notification(
        cls,
        title: str,
        message: str,
        notif_type: NotificationType | str = "info",
        staff_id: int | None = None,
    ) -> int:
        notif_type = NotificationType(notif_type)
        new_notif = cls(
            title=title,
            message=message,
            staff_id=staff_id,
            type=notif_type,
        )

        db.session.add(new_notif)
        if not safe_commit():
            logger.error("Could not create admin notification.")
            return 0
        return new_notif.id

    @classmethod
    def mark_notification_as_read(cls, notification_id: int):
        notification = cls.query.get(notification_id)
        if not notification:
            raise ValueError("Notification not found")
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        if not safe_commit():
            logger.error("Failed to mark notification.")


class SalesSummary(db.Model):
    __tablename__ = 'sales_summary'

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[datetime] = mapped_column(DateTime, unique=True)
    total_sales: Mapped[float]
    orders: Mapped[int]
    returning_customers: Mapped[int]

    def __repr__(self):
        return f"<Sales_summary {self.date}>"


class DishesStats(db.Model):
    __tablename__ = 'dishes_stats'

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(db.String(10), unique=True)
    orders: Mapped[int]

    def __repr__(self):
        return f"<Dishes_stats {self.code}>"
