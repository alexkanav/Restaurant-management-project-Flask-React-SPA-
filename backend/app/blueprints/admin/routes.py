from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, set_access_cookies, unset_jwt_cookies

from .models import Staff
from app.blueprints.users.models import Order
from app.extensions import logger, db

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/api/auth/session', methods=['GET'])
@jwt_required()
def check_session():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    current_user_id = claims.get("id")
    if current_user_id is None:
        return jsonify(message='Invalid token: missing user ID'), 400

    user = db.session.get(Staff, current_user_id)
    if not user:
        return jsonify(message='User not found'), 404

    return jsonify(username=user.id), 200


@admin_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Lookup user in the database
    staff = Staff.query.filter_by(email=email).first()
    if not staff or not staff.check_password(password):
        return jsonify(message='Не вірний Логін або Пароль!'), 401

    # Create JWT with user identity
    access_token = create_access_token(
        identity=str(staff.id),
        additional_claims={
            "role": "staff",
            "id": staff.id
        }
    )
    response = jsonify(username=staff.username)
    set_access_cookies(response, access_token)
    return response, 200


@admin_bp.route('/api/auth/logout', methods=['GET'])
@jwt_required()
def logout():
    response = jsonify(message='Ви вийшли з системи')
    unset_jwt_cookies(response)
    return response, 200


@admin_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if Staff.query.filter(Staff.email == email).first():
        return jsonify(message='Ваша Email вже зареєстрована.'), 409

    if Staff.add_user(username, email, password):
        return jsonify(message='Ви успішно зареєстровані, увійдіть до системи.'), 200
    else:
        return jsonify(message='При реєстрації виникла помилка.'), 400


@admin_bp.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    claims = get_jwt()

    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    try:
        uncompleted_orders = Order.query.filter_by(completed_by=0).all()
        new_orders = [order.to_dict() for order in uncompleted_orders]
        return jsonify(new_orders=new_orders), 200

    except Exception:
        logger.exception("Order update error")
        return jsonify(message='Помилка при завантаженні замовлень'), 400


@admin_bp.route('/api/orders/count', methods=['GET'])
@jwt_required()
def get_order_count():
    try:
        current_order_number = Order.query.count()
        return jsonify(order_number=current_order_number), 200

    except Exception:
        logger.exception("Order count error")
        return jsonify(message='Помилка при перевірці замовлень'), 400


@admin_bp.route('/api/orders/<int:order_id>/complete', methods=['POST'])
@jwt_required()
def complete_order(order_id):
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    current_user_id = claims.get("id")
    if current_user_id is None:
        return jsonify(message='Invalid token: missing user ID'), 400

    try:
        Order.update(order_id, current_user_id)
        return jsonify(message='Замовлення виконано'), 200
    except Exception:
        logger.exception("Order close error")
        return jsonify(message='Замовлення скасовано'), 500

