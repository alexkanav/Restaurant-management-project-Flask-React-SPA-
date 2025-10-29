from flask_jwt_extended import create_access_token, jwt_required, get_jwt, set_access_cookies
from flask import Blueprint, request, jsonify

from .models import User, Dish, Order, Comment, Category, Coupon
from app.extensions import cache, logger, limiter, db
from app.utils import calculate_discount, calculate_order_lead_time


users_bp = Blueprint('users', __name__)


@users_bp.route('/api/users', methods=['POST'])
@limiter.limit("5 per minute")
def create_user():
    try:
        user_id = User.create_new_user()

        # Create JWT with user identity
        access_token = create_access_token(
            identity=str(user_id),
            additional_claims={
                "role": "client",
                "id": user_id
            }
        )

        response = jsonify(user_id=user_id)
        set_access_cookies(response, access_token)
        return response, 200

    except Exception:
        logger.exception("User not created")
        return jsonify(message="Помилка на сервері"), 500


@users_bp.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_current_user():
    claims = get_jwt()
    current_user_id = claims.get("id")
    return jsonify(id=current_user_id), 200


@users_bp.route('/api/users/discount', methods=['GET'])
@jwt_required()
def get_discount():
    claims = get_jwt()
    current_user_id = claims.get("id")

    if not current_user_id:
        return jsonify(message="Користувач не авторизований"), 401

    try:
        user = db.session.get(User, current_user_id)

        if not user:
            return jsonify(message="Користувача не знайдено"), 404

        total_sum = user.total_sum or 0

        discount = calculate_discount(total_sum)
        return jsonify(discount=discount), 200

    except Exception:
        logger.exception(f"Помилка при отриманні знижки для користувача {current_user_id}")
        return jsonify(message="Помилка на сервері"), 500


@users_bp.route('/api/get-comments', methods=['GET'])
@cache.cached(timeout=3600, key_prefix='get_comments')
def get_comments():
    try:
        data = Comment.query.order_by(Comment.id.desc()).limit(10).all()[::-1]
        comments = [
            {
                "id": c.id,
                "name": c.user_name,
                "time": c.comment_date_time.strftime('%d-%m-%Y'),
                "message": c.comment_text
            } for c in data
        ]

    except Exception:
        logger.exception("Comment query failed")
        comments = []

    return jsonify(comments), 200


@users_bp.route('/api/send-comment', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute")
def send_comment():
    claims = get_jwt()
    user_id = claims.get("id")

    try:
        data = request.get_json()
        if not data:
            raise ValueError("No comment data received")
        name = data.get('username')
        message = data.get('textarea')
        Comment.add_comment(user_id, name, message)

        # Invalidate the cache for get_comments
        cache.delete('get_comments')

        return jsonify(message="Ваш коментар надіслано на модерацію"), 201

    except Exception:
        logger.exception("Comment not processed")
        return jsonify(message="Помилка, коментар не надіслано."), 400


@users_bp.route('/api/menu', methods=['GET'])
@cache.cached(timeout=3600, key_prefix='get_menu')
def get_menu():
    popular = []
    recommended = []
    dishes = {}
    for dish in Dish.query.filter(Dish.price != 0).all():
        dishes[dish.code] = {
            "name": dish.name_ua,
            "description": dish.description,
            "price": dish.price,
            "is_popular": dish.is_popular,
            "is_recommended": dish.is_recommended,
            "image_link": dish.image_link,
            "likes": dish.likes,
            "extras": {dish_extra.name_ua: dish_extra.price for dish_extra in dish.extras}
        }
        if dish.is_popular:
            popular.append(dish.code)
        if dish.is_recommended:
            recommended.append(dish.code)

    categories = [
                {category.name: [dish.code for dish in category.dishes if dish.price != 0]}
                for category in Category.query.order_by(Category.order.asc()).all()
            ]

    categories.append({"Популярне": popular})
    categories.append({"Рекомендуємо": recommended})

    menu = {"categories": categories, "dishes": dishes}
    return jsonify(menu=menu), 200


@users_bp.route('/api/order', methods=['POST'])
@jwt_required()
def place_order():
    claims = get_jwt()
    user_id = claims.get("id")

    try:
        order = request.get_json()
        if not order:
            raise ValueError("No order data received")

        table_num = order.pop('table', 0)
        original_cost = float(order.pop('totalCost', 0))
        loyalty_pct = int(order.pop('loyaltyPercentage', 0))
        coupon_pct = int(order.pop('couponPercentage', 0))
        final_cost = float(order.pop('payable', 0))
        new_order_id = Order.add_order(
            user_id,
            table_num,
            original_cost,
            loyalty_pct,
            coupon_pct,
            final_cost,
            order,
        )
        order_lead_time = calculate_order_lead_time(order.keys())

        return jsonify(message="Ваше замовлення прийнято", id=new_order_id, leadTime=order_lead_time), 201

    except Exception:
        logger.exception("Order not processed")
        return jsonify(message="Помилка на сервері"), 500


@users_bp.route('/api/dishes/<int:dish_code>/like', methods=['PATCH'])
@jwt_required()
@limiter.limit("5 per minute")
def like_dish(dish_code: int):
    try:
        if not Dish.increment_likes(dish_code):
            return jsonify(success=False), 400
        return jsonify(success=True), 200
    except Exception:
        logger.exception("Like update error")
        return jsonify(success=False), 500


@users_bp.route('/api/coupon/<string:coupon_code>', methods=['POST'])
@jwt_required()
def get_coupon(coupon_code: str):
    claims = get_jwt()
    user_id = claims.get("id")

    try:
        coupon = Coupon.query.filter_by(code=coupon_code).first()
        if not coupon:
            return jsonify(message="Купон не знайдено"), 404

        success, discount = coupon.use_coupon(user_id)
        if not success:
            return jsonify(message="Купон невалідний або протермінований"), 400

        return jsonify(discount=discount), 200

    except Exception:
        logger.exception("Помилка при використанні купона")
        return jsonify(message="Сталася помилка"), 500

