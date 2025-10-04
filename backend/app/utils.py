from collections.abc import Iterable
from config import DISCOUNT_TIERS, DISH_PREP_TIME


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


