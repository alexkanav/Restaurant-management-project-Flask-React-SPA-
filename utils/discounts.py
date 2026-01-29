from domain.core.constants import DISCOUNT_TIERS


def calculate_discount(total_sum: float, tiers: list[tuple[int, int]] = DISCOUNT_TIERS) -> int:
    """
    Calculate discount based on total sum and tiered thresholds.

    Args:
        total_sum (float): The user's total purchase amount.
        tiers (list of tuples): Each tuple is (threshold, discount_percent).

    Returns:
        int: The applicable discount percentage.
    """

    sorted_tiers = sorted(tiers)

    discount = 0
    for threshold, rate in sorted_tiers:
        if total_sum >= threshold:
            discount = rate
        else:
            break
    return discount
