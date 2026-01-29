import string
import secrets


def generate_coupon_code(length=10) -> str:
    """Generate a secure random coupon code."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))
