from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, set_access_cookies, unset_jwt_cookies

from .models import Staff, SalesSummary, DishesStats, AdminNotification
from app.blueprints.users.models import Order, Category, Dish
from app.extensions import logger, db, cache
from werkzeug.utils import secure_filename
from app.utils import is_allowed_file, validate_image, resize_and_save_image

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


@admin_bp.route('/api/statistics', methods=['GET'])
@jwt_required()
def statistics():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    date = []
    total_sales = []
    orders = []
    returning_customers = []
    avg_check_size = []

    dishes = []
    dish_orders = []

    all_sales = SalesSummary.query.order_by(SalesSummary.date).all()

    for sale in all_sales:
        date.append(sale.date.strftime('%d-%m'))
        total_sales.append(sale.total_sales)
        orders.append(sale.orders)
        returning_customers.append(sale.returning_customers)
        avg_check = sale.total_sales / sale.orders if sale.orders > 0 else 0.0
        avg_check_size.append(round(avg_check, 2))

    sales_summary = {
        'date': date,
        'totalSales': total_sales,
        'avgCheckSize': avg_check_size,
        'orders': orders,
        'returningCustomers': returning_customers,
    }

    dishes_stats_raw = DishesStats.query.order_by(DishesStats.orders.desc()).all()

    for dish in dishes_stats_raw:
        dishes.append(dish.code)
        dish_orders.append(dish.orders)

    dishes_stats = {
        'dishes': dishes,
        'orders': dish_orders,
    }

    return jsonify(salesSummary=sales_summary, dishesStats=dishes_stats), 200


@admin_bp.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_image():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    if 'image' not in request.files:
        return jsonify(error='No image uploaded'), 400

    file = request.files['image']
    filename = secure_filename(file.filename)
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if not (is_allowed_file(filename, allowed_extensions) and validate_image(file)):
        return jsonify(error='Invalid image file'), 400

    saved_name = resize_and_save_image(file, current_app.config["UPLOAD_FOLDER"], 1000)

    if saved_name:
        image_url = saved_name
        return jsonify(message='Image uploaded successfully', url=image_url), 200

    return jsonify(error='Error saving image'), 500


@admin_bp.route('/api/menu', methods=['GET'])
@jwt_required()
def get_category():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    dishes = {}
    for dish in Dish.query.all():
        dishes[dish.code] = {
            "name": dish.name_ua,
            "description": dish.description,
            "price": dish.price,
            "image_link": dish.image_link,
            "extras": {dish_extra.name_ua: dish_extra.price for dish_extra in dish.extras}
        }

    categories = [
                {category.name: [dish.code for dish in category.dishes]}
                for category in Category.query.order_by(Category.order.asc()).all()
            ]
    category_name_to_id = {cat: i for cat, i in db.session.query(Category.name, Category.id).all()}

    return jsonify(dishes=dishes, categories=categories, categoryIdMap=category_name_to_id), 200


@admin_bp.route('/api/category/update', methods=['PATCH'])
@jwt_required()
def category_update():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    try:
        data = request.get_json()
        Category.update_categories(data["categories"])
        cache.delete('get_menu')
        return jsonify(message="Категорії оновлено"), 200

    except Exception:
        logger.exception("Category update error")
        return jsonify(message="Категорії не оновлено"), 400


@admin_bp.route('/api/dish/update', methods=['POST'])
@jwt_required()
def dish_update():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    try:
        data = request.get_json()
        code = Dish.add_or_update_dish(data)
        cache.delete('get_menu')

        return jsonify(message=f"Страву з кодом {code} оновлено"), 200

    except Exception:
        logger.exception("Dish update error")
        return jsonify(message="Помилка оновлення страви"), 400


@admin_bp.route('/api/notification/count', methods=['GET'])
@jwt_required()
def get_unread_notification_count():
    try:
        count = AdminNotification.query.filter_by(is_read=False).count()
        return jsonify(unread_notif_number=count), 200
    except Exception:
        logger.exception("Unread notification count error")
        return jsonify(message='Помилка при перевірці сповіщень'), 400


@admin_bp.route('/api/notification/unread', methods=['GET'])
@jwt_required()
def get_unread_notifications():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    try:
        notif = AdminNotification.query.filter_by(is_read=False).order_by(AdminNotification.created_at.asc()).all()
        data = [
            {
                "id": n.id,
                "title": n.title,
                "staff_id": n.staff_id,
                "message": n.message,
                "type": n.type.value if hasattr(n.type, "value") else n.type,
                "created_at": n.created_at.isoformat(),
            }
            for n in notif
        ]
        return jsonify(data), 200

    except Exception:
        logger.exception("Error fetching unread notifications")
        return jsonify(message="Помилка завантаження сповіщень"), 400


@admin_bp.route("/api/notifications/<int:notification_id>/mark_as_read", methods=["PATCH"])
@jwt_required()
def mark_notification_as_read(notification_id: int):
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    try:
        AdminNotification.mark_notification_as_read(notification_id)
        return jsonify(
            message=f"Сповіщення:{notification_id} помічене як прочитане"
        ), 200

    except Exception as e:
        logger.exception("Error marking notification as read")
        return jsonify(message=f"Помилка оновлення сповіщення:{notification_id}"), 400


