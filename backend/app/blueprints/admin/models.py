from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import DateTime, JSON
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db, safe_commit, logger


class Staff(db.Model):
    __tablename__ = 'staff'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(db.String(200))
    email: Mapped[str] = mapped_column(db.String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(db.String(100))

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
