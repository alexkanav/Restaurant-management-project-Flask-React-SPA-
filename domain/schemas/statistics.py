from datetime import date
from pydantic import BaseModel, Field


class StatisticsQuerySchema(BaseModel):
    start_date: date = Field(..., alias="startDate")
    end_date: date = Field(..., alias="endDate")

    class Config:
        allow_population_by_field_name = True


class SalesSummarySchema(BaseModel):
    dates: list[str]
    total_sales: list[float]
    avg_check_sizes: list[float]
    orders: list[int]
    returning_customers: list[int]


class DishOrderStatsSchema(BaseModel):
    dishes: list[str]
    orders: list[int]


class StatisticsResponseSchema(BaseModel):
    sales_summary: SalesSummarySchema
    dish_order_stats: DishOrderStatsSchema
