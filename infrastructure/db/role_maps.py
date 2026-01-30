from utils.enums import UserRole
from infrastructure.db.models.users import User
from infrastructure.db.models.admin import Staff

ROLE_MODEL_MAP = {
    UserRole.client: User,
    UserRole.staff: Staff,
}
