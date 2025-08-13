import os
from time import time
from flask import Blueprint, request, jsonify, send_from_directory, current_app

from .models import User, Dish, Order, Comment
from app.blueprints.admin.models import Price, Category
from app.extensions import cache, logger, safe_commit, limiter
from config import table_numbers, addOnMenu, category_icons


users_bp = Blueprint('users', __name__, template_folder='templates')

# Serve React build
@users_bp.route('/', defaults={'path': ''})
@users_bp.route('/<path:path>')
def serve(path):
    react_dir = os.path.abspath(os.path.join(current_app.root_path, '..', '..', 'frontend'))

    if path != "" and os.path.exists(os.path.join(react_dir, path)):
        return send_from_directory(react_dir, path)
    else:
        return send_from_directory(react_dir, 'index.html')


@users_bp.route('/api/comments', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def handle_comments():
    if request.method == 'GET':
        try:
            data = Comment.query.order_by(Comment.comment_date_time.desc()).limit(10).all()
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

    if request.method == 'POST':
        data = request.get_json()
        comment = {
            'name': data.get('name'),
            'message': data.get('message')
        }

        user_id = request.cookies.get('user_id')
        if not user_id or not user_id.isdigit():
            return jsonify({'message': 'Ви не зареєстровані, можливо, у вашому браузері блокуються cookie'})

        user_id = int(user_id)
        Comment.add_comment(user_id, comment['name'], comment['message'])
        return jsonify({'message': 'Дякуємо за відгук!'}), 201


@users_bp.route('/api/user-id', methods=['POST'])
def new_user():
    new_user_id = str(User.create_new_user())

    return jsonify({'userId': new_user_id})


@users_bp.route('/api/cards', methods=['GET'])
@cache.cached(timeout=3600)
def get_cards():
    price = Price.query.first().price
    menu = {i.category: i.names for i in Category.query}
    dish_attributes = {
        i.dish_code: {
            'name': i.name_ua, 'description': i.description, 'image_link': i.image_link, 'likes': i.likes
        } for i in Dish.query
    }
    categories_number = len(menu)
    context = {
        'table_numbers': table_numbers,
        'addOnMenu': addOnMenu,
        'category_icons': category_icons,
        'menu': menu,
        'dish_attributes': dish_attributes,
        'price': price,
        'categories_number': categories_number
    }
    return jsonify(context)


@users_bp.route('/api/order', methods=['POST'])
def get_order_from_client():
    try:
        order = request.get_json()
        if not order:
            raise ValueError("No order data received")

        user_id_cookie = request.cookies.get('user_id')
        try:
            user_id = int(user_id_cookie)
        except (TypeError, ValueError):
            logger.warning("Invalid or missing user_id cookie")
            user_id = 0

        order_sum = int(order.pop('totalCost', 0))
        table_num = order.pop('table', 0)
        order_id = f"{int(time())}-{user_id}"

        Order.add_order(user_id, order_id, table_num, order_sum, order)

        User.update(user_id, order_sum)

        return jsonify({"processed": "Ваше замовлення прийнято", "id": order_id}), 201

    except Exception:
        logger.exception("Order not processed")
        return jsonify({"processed": False}), 400


@users_bp.route('/api/add-like', methods=['POST'])
def post_order_like():
    try:
        data = request.get_json()
        like_id = data.get("dishId")
        if not like_id:
            raise ValueError("Missing like_id in request")
        Dish.query.filter_by(dish_code=like_id).update({Dish.likes: Dish.likes + 1})

        if not safe_commit():
            logger.error("Could not update dish views.")

        return jsonify({"success": True}), 200

    except Exception:
        logger.exception("Like update error")
        return jsonify({"success": False}), 400

