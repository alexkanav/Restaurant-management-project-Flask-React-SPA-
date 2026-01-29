from pydantic import BaseModel


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


