from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from sqlalchemy.types import DateTime, JSON

from app.extensions import db, logger, safe_commit


class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    comments: Mapped[list["Comment"]] = relationship(back_populates="user")

    @property
    def sessions(self) -> int:
        return len(self.orders)

    @property
    def total_sum(self) -> int:
        return sum(order.order_sum for order in self.orders)

    def __repr__(self):
        return f"<User {self.id}>"

    @classmethod
    def create_new_user(cls):
        new_user = cls()
        db.session.add(new_user)
        if not safe_commit():
            logger.error("Could not create new user.")
            return None
        return new_user.id


class Category(db.Model):
    __tablename__ = 'categories'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True)

    dishes: Mapped[list["Dish"]] = relationship(back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"


class Dish(db.Model):
    __tablename__ = 'dishes'

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[int] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True)
    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id'))
    is_popular: Mapped[bool] = mapped_column(default=False)
    is_recommended: Mapped[bool] = mapped_column(default=False)
    name_ua: Mapped[str] = mapped_column(db.String(20))
    price: Mapped[int]
    description: Mapped[str] = mapped_column(db.String(300))
    image_link: Mapped[str] = mapped_column(db.String(50))
    views: Mapped[int] = mapped_column(default=0)
    likes: Mapped[int] = mapped_column(default=0)

    extras: Mapped[list["DishExtra"]] = relationship(back_populates="dish")
    category: Mapped["Category"] = relationship(back_populates="dishes")

    def __repr__(self):
        return f"<Dish {self.code} name={self.name}>"


class DishExtra(db.Model):
    __tablename__ = 'dish_extras'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True)
    name_ua: Mapped[str] = mapped_column(db.String(20))
    price: Mapped[int]
    dish_id: Mapped[int] = mapped_column(ForeignKey('dishes.id'))

    dish: Mapped["Dish"] = relationship(back_populates="extras")

    def __repr__(self):
        return f"<DishExtra {self.name}>"


class Order(db.Model):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_by: Mapped[int] = mapped_column(default=0)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    table_number: Mapped[int] = mapped_column(nullable=True)
    order_sum: Mapped[int]
    order_details = mapped_column(JSON)

    user: Mapped["User"] = relationship(back_populates="orders")

    def __repr__(self):
        return f"<Order {self.id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "table": self.table_number,
            "order_details": self.order_details,
            "order_sum": self.order_sum
        }

    @classmethod
    def add_order(cls, user_id: int, table_num: int, order_sum: int, order: JSON):
        new_order = cls(
            user_id=user_id,
            table_number=table_num,
            order_sum=order_sum,
            order_details=order
        )
        db.session.add(new_order)
        if not safe_commit():
            logger.error("Could not add order.")
            return None
        return new_order.id

    @classmethod
    def update(cls, id: int, employee_id: int):
        instance = db.session.get(cls, id)
        if not instance:
            raise ValueError("Order not found")
        instance.completed_by = employee_id
        if not safe_commit():
            logger.error("Could not close order.")


class Comment(db.Model):
    __tablename__ = 'comments'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user_name: Mapped[str] = mapped_column(db.String(20))
    comment_date_time: Mapped[str] = mapped_column(db.String(10))
    comment_text: Mapped[str] = mapped_column(db.String(200))

    user: Mapped["User"] = relationship(back_populates="comments")

    def __repr__(self):
        return f"<Comment {self.id}"

    @classmethod
    def add_comment(cls, user_id: int, comm_name: str, comm_text: str):
        new_comment = cls(
            user_id=user_id,
            user_name=comm_name,
            comment_date_time=datetime.today().strftime("%d-%m-%Y %H:%M"),
            comment_text=comm_text
        )
        db.session.add(new_comment)
        if not safe_commit():
            logger.error("Could not add comment.")

