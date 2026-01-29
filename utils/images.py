from pathlib import Path
from PIL import Image
import uuid
from typing import BinaryIO
import logging

from domain.core.settings import settings
from domain.core.errors import NotFoundError, ConflictError, DomainValidationError, DomainError

logger = logging.getLogger(__name__)


def validate_image(file_obj: BinaryIO) -> None:
    """Ensure the uploaded file is a valid image."""
    try:
        with Image.open(file_obj) as img:
            img.verify()

        file_obj.seek(0)

        # Reject animated images (e.g. GIFs)
        with Image.open(file_obj) as img:
            if getattr(img, "is_animated", False):
                raise DomainValidationError("Animated images are not supported")

    except DomainValidationError:
        raise
    except Exception:
        logger.exception("Invalid_image_file")
        raise DomainValidationError("Invalid image file")
    finally:
        file_obj.seek(0)


def resize_and_save_image(
        file_obj: BinaryIO,
        user_id: int,
        upload_folder: str | Path,
        filename: str,
        max_width: int = 1000,
) -> None:
    try:
        upload_path = Path(upload_folder)
        upload_path.mkdir(parents=True, exist_ok=True)

        with Image.open(file_obj) as img:
            img.thumbnail((max_width, max_width), Image.LANCZOS)

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            img.save(
                upload_path / filename,
                quality=85,
                optimize=True,
            )
            logger.info(f"Image_created path={upload_path / filename} user_id={user_id}")

    except (OSError, ValueError):
        logger.exception("Error_saving_image")
        raise DomainError("Error saving image")


def process_image_upload(
        file: BinaryIO,
        user_id: int,
        upload_folder: str | None = None,
        allowed_extensions: set[str] | None = None,
        max_width: int = 1000,
) -> str:
    if upload_folder is None:
        upload_folder = settings.UPLOAD_DIR

    if allowed_extensions is None:
        allowed_extensions = {"png", "jpg", "jpeg"}

    suffix = Path(file.filename).suffix
    if not suffix:
        raise DomainValidationError("Missing file extension")

    ext = suffix.lstrip(".").lower()
    if ext not in allowed_extensions:
        raise ConflictError("Unsupported file type")

    mime = getattr(file, "mimetype", None) or getattr(file, "content_type", None)
    if mime and not mime.startswith("image/"):
        raise DomainValidationError("Invalid MIME type")

    file_obj = getattr(file, "file", None) or getattr(file, "stream", None)
    if file_obj is None:
        raise NotFoundError("Invalid file object")

    validate_image(file_obj)

    ext = "jpg" if ext == "jpeg" else ext
    filename = f"{uuid.uuid4().hex}.{ext}"

    resize_and_save_image(
        file_obj=file_obj,
        user_id=user_id,
        upload_folder=upload_folder,
        filename=filename,
        max_width=max_width,
    )

    return filename
