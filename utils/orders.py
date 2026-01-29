from collections.abc import Iterable

from domain.core.constants import DISH_PREP_TIME


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
