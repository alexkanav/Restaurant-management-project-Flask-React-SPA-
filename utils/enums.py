from enum import Enum


class NotificationType(str, Enum):
    info = "info"
    warning = "warning"
    urgent = "urgent"
    success = "success"


class UserRole(str, Enum):
    client = "client"
    staff = "staff"
    admin = "admin"
