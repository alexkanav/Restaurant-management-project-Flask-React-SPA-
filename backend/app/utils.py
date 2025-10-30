import os
from PIL import Image
import uuid
from collections.abc import Iterable
import enum
import secrets
import string

from config import DISCOUNT_TIERS, DISH_PREP_TIME
from app.extensions import logger


class NotificationType(enum.Enum):
    info = "info"
    warning = "warning"
    urgent = "urgent"
    success = "success"


def calculate_discount(total_sum: float, tiers: [list[tuple[float, int]]] = None) -> int:
    """
    Calculate discount based on total sum and tiered thresholds.

    Args:
        total_sum (float): The user's total purchase amount.
        tiers (list of tuples): Each tuple is (threshold, discount_percent).

    Returns:
        int: The applicable discount percentage.
    """
    if tiers is None:
        tiers = DISCOUNT_TIERS

    sorted_tiers = sorted(tiers)

    discount = 0
    for threshold, rate in sorted_tiers:
        if total_sum >= threshold:
            discount = rate
        else:
            break
    return discount


def calculate_order_lead_time(dishes: Iterable[str]) -> int:
    """
    Calculates the lead time for an order based on the longest dish prep time.
    Lead time is determined by the dish that takes the most time to prepare.

    Args:
       dishes: A list or iterable of dish names (strings).

    Returns:
       The maximum prep time among the dishes, or 0 if no dishes are provided.
    """
    if not dishes:
        return 0

    return max(DISH_PREP_TIME.get(dish, 0) for dish in dishes)


def is_allowed_file(filename: str, allowed_extensions: set[str]) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def validate_image(file_stream) -> bool:
    """Try to open the file with Pillow to ensure it's a real image."""
    try:
        image = Image.open(file_stream)
        image.verify()
        file_stream.seek(0)  # rewind after verify
        return True
    except Exception:
        logger.exception("Invalid image file")
        return False


def resize_and_save_image(file_stream, upload_folder: str, max_width=1000) -> str:
    """
    Resize an image to a maximum width (preserving aspect ratio),
    and save it with a unique filename. Returns filename or '' on failure.
    """
    try:
        file_stream.seek(0)
        image = Image.open(file_stream)

        # Get extension from format
        format_ext = f".{(image.format or 'jpg').lower()}"
        if format_ext == ".jpeg":
            format_ext = ".jpg"

        # Resize
        if image.width > max_width:
            ratio = max_width / float(image.width)
            new_height = int(image.height * ratio)
            image = image.resize((max_width, new_height), Image.LANCZOS)

        os.makedirs(upload_folder, exist_ok=True)

        # Save
        filename = f"{uuid.uuid4().hex}{format_ext}"
        filepath = os.path.join(upload_folder, filename)
        image.save(filepath)
        logger.info(f"Image saved: {filepath}")

        return filename

    except Exception:
        logger.exception("Error saving image")
        return ''


def generate_coupon_code(length=10):
    """Generate a secure random coupon code."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))