from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, func, DateTime, JSON

from app.extensions import db, logger, safe_commit
from app.utils import generate_coupon_code


dish_extra_link = db.Table(
    'dish_extra_link',
    db.Column('dish_id', db.ForeignKey('dishes.code'), primary_key=True),
    db.Column('extra_id', db.ForeignKey('dish_extras.id'), primary_key=True)
)


class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    comments: Mapped[list["Comment"]] = relationship(back_populates="user")
    coupons: Mapped[list["Coupon"]] = relationship(back_populates="user")
    like_rel: Mapped[list["DishLike"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    @property
    def sessions(self) -> int:
        return db.session.query(func.count(Order.id)).filter_by(user_id=self.id).scalar()

    @property
    def total_sum(self) -> int:
        return db.session.query(func.sum(Order.final_cost)).filter_by(user_id=self.id).scalar() or 0

    def __repr__(self) -> str:
        return f"<User {self.id}>"

    @classmethod
    def create_new_user(cls) -> int:
        new_user = cls()
        db.session.add(new_user)
        if not safe_commit():
            logger.error("Could not create new user.")
            return 0
        return new_user.id


class Category(db.Model):
    __tablename__ = 'categories'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(db.String(30), unique=True)
    order: Mapped[int] = mapped_column(default=0)

    dishes: Mapped[list["Dish"]] = relationship(back_populates="category")

    def __repr__(self) -> str:
        return f"<Category {self.name}>"

    @classmethod
    def update_categories(cls, categories: list[str]) -> None:
        """
        order_list: list of category names in the desired order.
        If a category name doesn't exist, it will be created.
        """
        existing_names = {name for (name,) in db.session.query(cls.name).all()}

        for order, name in enumerate(categories, start=1):
            if name in existing_names:
                # Update existing category’s order
                db.session.query(cls).filter_by(name=name).update(
                    {"order": order},
                    synchronize_session=False
                )
            else:
                # Create new category if not found
                new_category = Category(name=name, order=order)
                db.session.add(new_category)

        if not safe_commit():
            logger.error("Could not update categories.")


class Dish(db.Model):
    __tablename__ = 'dishes'

    code: Mapped[int] = mapped_column(primary_key=True)
    name_en: Mapped[str] = mapped_column(db.String(30))
    category_id: Mapped[int] = mapped_column(ForeignKey('categories.id'))
    is_popular: Mapped[bool] = mapped_column(default=False)
    is_recommended: Mapped[bool] = mapped_column(default=False)
    name_ua: Mapped[str] = mapped_column(db.String(50))
    price: Mapped[int] = mapped_column(default=0)
    description: Mapped[str] = mapped_column(db.String(500))
    image_link: Mapped[str] = mapped_column(db.String(50))
    views: Mapped[int] = mapped_column(default=0)
    likes: Mapped[int] = mapped_column(default=0)

    category: Mapped["Category"] = relationship(back_populates="dishes")
    like_rel: Mapped[list["DishLike"]] = relationship(back_populates="dish", cascade="all, delete-orphan")
    extras: Mapped[list["DishExtra"]] = relationship(
        secondary=dish_extra_link,
        back_populates="dishes"
    )

    def __repr__(self) -> str:
        return f"<Dish {self.code} name={self.name_ua}>"

    @classmethod
    def add_or_update_dish(cls, dish_data: dict[str, str | int]) -> int | None:
        raw_price = dish_data.get("price")
        price = int(raw_price) if raw_price != "" else 0
        dish = db.session.query(cls).filter_by(code=dish_data["code"]).first()
        if dish:
            if dish_data.get("name_ua"):
                dish.name_ua = dish_data["name_ua"]
            if dish_data.get("description"):
                dish.description = dish_data["description"]
            if dish_data.get("image_link"):
                dish.image_link = dish_data["image_link"]
            dish.price = price
        else:
            dish = cls(
                code=dish_data["code"],
                name_ua=dish_data["name_ua"],
                category_id=dish_data["category_id"],
                description=dish_data["description"],
                price=price,
                image_link=dish_data["image_link"],
            )
            db.session.add(dish)

        if not safe_commit():
            logger.error("Could not add or update dish.")
            return None

        return dish.code

    @classmethod
    def like_dish(cls, user_id: int, dish_code: int) -> tuple[bool, str]:
        dish = cls.query.get(dish_code)
        if not dish:
            return False, "Страву не знайдено"

        # Prevent duplicate likes
        if DishLike.query.filter_by(user_id=user_id, dish_code=dish_code).first():
            return False, "Ви вже оцінювали цей продукт"

        new_like = DishLike(user_id=user_id, dish_code=dish_code)
        dish.likes += 1
        db.session.add(new_like)

        if not safe_commit():
            logger.error("Failed to like dish")
            return False, "Вподобання не додано"

        logger.info(f"User {user_id} liked dish {dish_code}")
        return True, "Вподобання додано"


class DishLike(db.Model):
    __tablename__ = "dish_likes"

    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), primary_key=True)
    dish_code: Mapped[int] = mapped_column(ForeignKey('dishes.code'), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="like_rel")
    dish: Mapped["Dish"] = relationship(back_populates="like_rel")

    def __repr__(self) -> str:
        return f"<DishLike user_id={self.user_id} dish_code={self.dish_code}>"


class DishExtra(db.Model):
    __tablename__ = 'dish_extras'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(db.String(20), unique=True)
    name_ua: Mapped[str] = mapped_column(db.String(20))
    price: Mapped[int] = mapped_column(default=0)

    dishes: Mapped[list["Dish"]] = relationship(
        secondary=dish_extra_link,
        back_populates="extras"
    )

    def __repr__(self) -> str:
        return f"<DishExtra {self.name}>"


class Order(db.Model):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_by: Mapped[int] = mapped_column(default=0)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    table_number: Mapped[int] = mapped_column(nullable=True)
    original_cost: Mapped[float] = mapped_column(db.Float)
    loyalty_pct: Mapped[int] = mapped_column(default=0)
    coupon_pct: Mapped[int] = mapped_column(default=0)
    final_cost: Mapped[float] = mapped_column(db.Float)
    order_details: Mapped[dict] = mapped_column(JSON)

    user: Mapped["User"] = relationship(back_populates="orders")

    def __repr__(self) -> str:
        return f"<Order {self.id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "table": self.table_number,
            "order_details": self.order_details,
            "original_cost": self.original_cost,
            "loyalty_pct": self.loyalty_pct,
            "coupon_pct": self.coupon_pct,
            "final_cost": self.final_cost,
        }

    @classmethod
    def add_order(
        cls,
        user_id: int,
        table_num: int,
        original_cost: float,
        loyalty_pct: int,
        coupon_pct: int,
        final_cost: float,
        order: JSON,
    ) -> int:
        new_order = cls(
            user_id=user_id,
            table_number=table_num,
            original_cost=original_cost,
            loyalty_pct=loyalty_pct,
            coupon_pct=coupon_pct,
            final_cost=final_cost,
            order_details=order,
        )
        db.session.add(new_order)
        if not safe_commit():
            logger.error("Could not add order.")
            return 0
        return new_order.id

    @classmethod
    def update(cls, id: int, employee_id: int) -> None:
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
    comment_date_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    comment_text: Mapped[str] = mapped_column(db.String(200))

    user: Mapped["User"] = relationship(back_populates="comments")

    def __repr__(self) -> str:
        return f"<Comment {self.id}>"

    @classmethod
    def add_comment(cls, user_id: int, comm_name: str, comm_text: str) -> None:
        new_comment = cls(
            user_id=user_id,
            user_name=comm_name,
            comment_text=comm_text
        )
        db.session.add(new_comment)
        if not safe_commit():
            logger.error("Could not add comment.")


class Coupon(db.Model):
    __tablename__ = 'coupons'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(db.String(20), unique=True)
    discount_value: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)

    user: Mapped['User'] = relationship('User', back_populates='coupons')

    def __repr__(self) -> str:
        return f"<Coupon {self.code}>"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "code": self.code,
            "discount_value": self.discount_value,
            "expires_at": self.expires_at.strftime("%d-%m-%Y") if self.expires_at else None,
        }

    @classmethod
    def create_coupon(cls, data: dict) -> int:
        expires_at = None
        if data.get('expires_at'):
            try:
                expires_at = datetime.strptime(data['expires_at'], "%d-%m-%Y")
            except ValueError:
                logger.warning(f"Invalid date format for expires_at: {data['expires_at']}")
                expires_at = None

        if data.get('code') and cls.query.filter_by(code=data['code']).first():
            logger.warning(f"Coupon code {data['code']} already exists.")
            return 0
        new_coupon = cls(
            code=data.get('code') or generate_coupon_code(),
            discount_value=data.get('discount_value', 0),
            is_active=True,
            expires_at=expires_at,
        )
        db.session.add(new_coupon)
        if not safe_commit():
            logger.error("Could not add coupon.")
            return 0
        return new_coupon.id

    def use_coupon(self, user_id: int) -> tuple[bool, int]:
        """
        Marks the coupon as used by the given user if it is active and not expired.

        Returns:
            (bool, int): A tuple indicating whether the coupon was successfully used
                         and the discount value to apply.
        """
        if not self.is_active:
            logger.warning(f"Coupon {self.code} is inactive.")
            return False, 0

        if self.expires_at and datetime.utcnow() > self.expires_at:
            logger.warning(f"Coupon {self.code} has expired.")
            return False, 0

        self.user_id = user_id
        self.is_active = False

        if not safe_commit():
            logger.error(f"Failed to commit coupon usage for {self.code}.")
            return False, 0

        return True, self.discount_value

    @classmethod
    def deactivate_coupon(cls, coupon_id: int) -> bool:
        coupon = db.session.get(cls, coupon_id)
        if not coupon:
            raise ValueError("Coupon not found")
        coupon.is_active = False
        if not safe_commit():
            logger.error("Could not deactivate coupon.")
            return False

        return True


