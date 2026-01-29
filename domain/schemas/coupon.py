from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, field_serializer, field_validator, Field


class CouponSchema(BaseModel):
    id: int
    code: str
    discount_value: int
    expires_at: date | None

    @field_serializer("expires_at")
    def format_date(self, value: date | None):
        return value.strftime("%Y-%m-%d") if value else None

    model_config = ConfigDict(from_attributes=True)


class CouponCreateSchema(BaseModel):
    code: str | None = None
    discount_value: int = Field(gt=0, le=100)
    expires_at: date | None

    model_config = ConfigDict(from_attributes=True)

    # validator to convert string -> date
    @field_validator("expires_at", mode="before")
    @classmethod
    def parse_date(cls, v):
        if not v:
            return None
        try:
            return datetime.strptime(v, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(f"expires_at must be in yyyy-mm-dd format, got {v}")
