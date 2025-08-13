from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import DateTime, JSON

from app.extensions import db, logger, safe_commit


class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user_id: Mapped[int] = mapped_column(unique=True)
    sessions: Mapped[int] = mapped_column(default=0)
    total_sum: Mapped[int] = mapped_column(default=0)

    def __repr__(self):
        return f"<User {self.user_id}>"

    @classmethod
    def create_new_user(cls):
        """Creates a new user and saves it to the database."""
        last_user = db.session.query(cls).order_by(cls.id.desc()).first()
        new_user_id = last_user.user_id + 1 if last_user else 1
        new_user = cls(user_id=new_user_id)
        db.session.add(new_user)
        if not safe_commit():
            logger.error("Could not create new user.")
        return new_user_id

    @classmethod
    def update(cls, user_id, order_sum):
        user = cls.query.filter(cls.user_id == user_id).first()
        if user:
            user.sessions += 1
            user.total_sum += order_sum
            if not safe_commit():
                logger.error("Could not update user.")


class Dish(db.Model):
    __tablename__ = 'dishes'

    id: Mapped[int] = mapped_column(primary_key=True)
    dish_code: Mapped[str] = mapped_column(unique=True)
    dish_name: Mapped[str] = mapped_column(db.String(20), unique=True)
    name_ua: Mapped[str] = mapped_column(db.String(20))
    description: Mapped[str] = mapped_column(db.String(300))
    image_link: Mapped[str] = mapped_column(db.String(50))
    views: Mapped[int] = mapped_column(default=0)
    likes: Mapped[int] = mapped_column(default=0)

    def __repr__(self):
        return f"<Dish {self.dish_code}>"


class Order(db.Model):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[str] = mapped_column(db.String(20), default=datetime.utcnow)
    order_id: Mapped[str] = mapped_column(db.String(15))
    completed: Mapped[str] = mapped_column(db.String(5), default='No')
    user_id: Mapped[int]
    table_number: Mapped[int] = mapped_column(nullable=True)
    order_sum: Mapped[int]
    order = mapped_column(JSON)

    def to_dict(self):
        return [self.id, self.table_number, self.order, self.order_sum]

    @classmethod
    def add_order(cls, user_id: int, order_id: str, table_num: int, order_sum: int, order: JSON):
        new_order = cls(
            user_id=user_id,
            order_id=order_id,
            table_number=table_num,
            order_sum=order_sum,
            order=order
        )
        db.session.add(new_order)
        if not safe_commit():
            logger.error("Could not add order.")

    @classmethod
    def update(cls, order_id, employee_id):
        cls.query.filter_by(id=order_id).update({cls.completed: employee_id})
        if not safe_commit():
            logger.error("Could not close order.")


class Comment(db.Model):
    __tablename__ = 'comments'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(unique=True)
    user_name: Mapped[str] = mapped_column(db.String(20))
    comment_date_time: Mapped[str] = mapped_column(db.String(10), default=datetime.today().strftime("%d-%m-%Y %H:%M"))
    comment_text: Mapped[str] = mapped_column(db.String(200))

    @classmethod
    def add_comment(cls, user_id: int, comm_name: str, comm_text: str):
        new_comment = cls(
            user_id=user_id,
            user_name=comm_name,
            comment_text=comm_text
        )
        db.session.add(new_comment)
        if not safe_commit():
            logger.error("Could not add order.")

