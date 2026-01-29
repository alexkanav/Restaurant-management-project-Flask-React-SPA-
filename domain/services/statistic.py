from datetime import date
from sqlalchemy import select
from sqlalchemy.orm import Session

from infrastructure.db.models.admin import SalesSummary, DishOrdersStats
from domain.schemas import SalesSummarySchema, DishOrderStatsSchema


def get_sales_summary(
        db: Session,
        start_date: date,
        end_date: date,
) -> SalesSummarySchema:
    stmt = (
        select(SalesSummary)
        .where(SalesSummary.date.between(start_date, end_date))
        .order_by(SalesSummary.date)
    )

    results = db.scalars(stmt).all()

    dates: list[str] = []
    total_sales: list[float] = []
    orders: list[int] = []
    returning_customers: list[int] = []
    avg_check_sizes: list[float] = []

    for row in results:
        dates.append(row.date.strftime("%d-%m"))
        total_sales.append(row.total_sales)
        orders.append(row.orders)
        returning_customers.append(row.returning_customers)

        avg_check_sizes.append(
            round(row.total_sales / row.orders, 2)
            if row.orders > 0
            else 0.0
        )

    return SalesSummarySchema(
        dates=dates,
        total_sales=total_sales,
        orders=orders,
        returning_customers=returning_customers,
        avg_check_sizes=avg_check_sizes,
    )


def get_dish_order_stats(db: Session, limit: int = 10) -> DishOrderStatsSchema:
    stmt = select(DishOrdersStats).order_by(DishOrdersStats.orders.desc()).limit(limit)
    results = db.scalars(stmt).all()

    return DishOrderStatsSchema(
        dishes=[row.code for row in results],
        orders=[row.orders for row in results]
    )
