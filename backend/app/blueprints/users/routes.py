from flask_jwt_extended import create_access_token, jwt_required, get_jwt, set_access_cookies
from flask import Blueprint, request, jsonify

from .models import User, Dish, Order, Comment, Category
from app.extensions import cache, logger, safe_commit, limiter


users_bp = Blueprint('users', __name__)


@users_bp.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_current_user():
    claims = get_jwt()
    current_user_id = claims.get("id")
    return jsonify(id=current_user_id), 200


@users_bp.route('/api/users', methods=['POST'])
@limiter.limit("1 per minute")
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
        return jsonify(message="Помилка на сервері"), 400


@users_bp.route('/api/get-comments', methods=['GET'])
@cache.cached(timeout=3600, key_prefix='get_comments')
def get_comments():
    try:
        data = Comment.query.order_by(Comment.id.desc()).limit(10).all()[::-1]
        comments = [
            {
                "id": c.id,
                "name": c.user_name,
                "time": c.comment_date_time,
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
    try:
        claims = get_jwt()
        user_id = claims.get("id")

        data = request.get_json()
        if not data:
            raise ValueError("No comment data received")
        name = data.get('name')
        message = data.get('message')
        Comment.add_comment(user_id, name, message)

        # Invalidate the cache for get_comments
        cache.delete('get_comments')

        return jsonify(message="Ваш коментар надіслано на модерацію"), 201

    except Exception:
        logger.exception("Comment not processed")
        return jsonify(message="Помилка, коментар не надіслано."), 400


@users_bp.route('/api/menu', methods=['GET'])
@cache.cached(timeout=3600)
def get_menu():
    popular = []
    recommended = []
    dishes = {}
    for dish in Dish.query.all():
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
                {category.name: [dish.code for dish in category.dishes]}
                for category in Category.query.all()
            ]
    categories.append({"Популярне": popular})
    categories.append({"Рекомендуємо": recommended})

    menu = {"categories": categories, "dishes": dishes}

    return jsonify(menu=menu), 200


@users_bp.route('/api/order', methods=['POST'])
@jwt_required()
def place_order():
    try:
        claims = get_jwt()
        user_id = claims.get("id")

        order = request.get_json()
        if not order:
            raise ValueError("No order data received")

        order_sum = int(order.pop('totalCost', 0))
        table_num = order.pop('table', 0)

        new_order_id = Order.add_order(user_id, table_num, order_sum, order)

        return jsonify({"message": "Ваше замовлення прийнято", "id": new_order_id}), 201

    except Exception:
        logger.exception("Order not processed")
        return jsonify(message="Помилка на сервері"), 400


@users_bp.route('/api/dishes/<int:dish_id>/like', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute")
def like_dish(dish_id):
    try:
        Dish.query.filter_by(code=dish_id).update({Dish.likes: Dish.likes + 1})

        if not safe_commit():
            logger.error("Could not update dish views.")

        return jsonify({"success": True}), 200

    except Exception:
        logger.exception("Like update error")
        return jsonify({"success": False}), 400

