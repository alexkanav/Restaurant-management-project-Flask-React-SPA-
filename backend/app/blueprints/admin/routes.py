from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, set_access_cookies, unset_jwt_cookies

from .models import Staff, SalesSummary, DishesStats
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

    return jsonify({
        'salesSummary': sales_summary,
        'dishesStats': dishes_stats,
    }), 200


@admin_bp.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_image():
    claims = get_jwt()

    # Check if the current user is an admin
    if claims.get("role") != "staff":
        return jsonify(message="Access Forbidden: Staff only"), 403

    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    filename = secure_filename(file.filename)
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if not (is_allowed_file(filename, allowed_extensions) and validate_image(file)):
        return jsonify({'error': 'Invalid image file'}), 400

    saved_name = resize_and_save_image(file, current_app.config["UPLOAD_FOLDER"], 1000)

    if saved_name:
        image_url = saved_name
        return jsonify({'message': 'Image uploaded successfully', 'url': image_url}), 200

    return jsonify({'error': 'Error saving image'}), 500


@admin_bp.route('/api/category/update', methods=['POST'])
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

# UPLOAD_FOLDER = 'uploads'
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# @admin_bp.route('/api/upload', methods=['POST'])
# def upload_image():
#     print(123)
#     # fileobj = request.files['file']
#     # dish_name = request.form['dish_name_2']
#     # file_extensions = ["JPG", "JPEG", "PNG", "GIF"]
#     # uploaded_file_extension = fileobj.filename.split(".")[1]
#     # if uploaded_file_extension.upper() in file_extensions:
#     #     destination_path = f"static/uploads/{fileobj.filename}"
#     #     if fileobj.filename in os.listdir('static/uploads/'):
#     #         d_t = datetime.today().strftime("%d%m%Y%H%M%S")
#     #         destination_path = f"static/uploads/{d_t}{fileobj.filename}"
#     #     fileobj.save(destination_path)
#
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image part'}), 402
#
#     file = request.files['image']
#
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 408
#
#     BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
#     UPLOAD_FOLDER = os.path.join(BASE_DIR, 'frontend', 'static', 'uploads')
#
#     # upload_folder = os.path.join(app.root_path, 'static', 'upload')  # e.g., 'C:\\myapp\\static\\upload'
#     # file_path2 = os.path.join(upload_folder, 'chart11.png')
#     # UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
#     # BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
#     # filepath = os.path.join('..', UPLOAD_FOLDER, file.filename)
#     # filepath = os.path.join('frontend', 'static', 'uploads')
#     print(75, UPLOAD_FOLDER)
#     # file.save(filepath)
#
#     return jsonify({'message': 'Image uploaded successfully', 'filename': file.filename})

# from flask import send_from_directory
#
# @admin_bp.route('/uploads/<filename>')
# def uploaded_file(filename):
#     return send_from_directory(UPLOAD_FOLDER, filename)


# backend/app.py
#################################################################
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from utils.uploads import save_image
#
# app = Flask(__name__)
# CORS(app)
#
# @app.route('/upload', methods=['POST'])
# def upload():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400
#
#     file = request.files['image']
#     if file.filename == '':
#         return jsonify({'error': 'Empty filename'}), 400
#
#     try:
#         image_url = save_image(file)
#         return jsonify({'message': 'Image uploaded successfully', 'url': image_url}), 200
#     except ValueError as e:
#         return jsonify({'error': str(e)}), 400

# @app.route('/upload', methods=['POST'])
# def upload():
#     file = request.files['image']
#
#     try:
#         resized_img = resize_image_max_width(file)
#
#         # Save to desired path
#         filename = secure_filename(file.filename)
#         filepath = os.path.join(UPLOAD_FOLDER, filename)
#
#         # Save the resized image
#         # resized_img.save(filepath)
#         resized_img.save(filepath, format='JPEG', quality=85)
#
#         return jsonify({'message': 'Image resized and saved', 'url': f'/static/uploads/{filename}'})
#
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400
