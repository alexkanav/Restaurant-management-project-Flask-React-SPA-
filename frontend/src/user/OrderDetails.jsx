import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useOrder } from '../context/OrderContext';
import { VIEWS } from '../constants/views';
import { sendToServer } from '../utils/api';


export default function OrderDetails({ loyaltyPercentage,  goTo, postOrder, userId, loading }) {
  const [couponPercentage, setCouponPercentage] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponAccepted, setCouponAccepted] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const { order } = useOrder();

  const total = order.totalCost ?? 0;
  const couponDiscount = total * couponPercentage / 100;
  const loyaltyDiscount = total * loyaltyPercentage / 100;
  const totalDiscount = couponDiscount + loyaltyDiscount;
  const payable = total - totalDiscount;

  const format = (num) => num.toFixed(2);

  const dishKeys = Object.keys(order).filter(
    key => key !== 'table' && key !== 'totalCost'
  );

  const getCoupon = async (e) => {
    e.preventDefault(); // prevent page refresh right away

    try {
      const { data } = await sendToServer(`/api/coupon/${couponCode}`, null, "POST");

      if (data?.discount !== undefined) {
        setCouponPercentage(data.discount);
        setCouponAccepted(true);
        setCouponError(false);
        toast.success("Знижка отримана!");
      } else {
        setCouponError(true);
        toast.warning("Помилка при використанні купона.");
      }
    } catch (error) {
      setCouponError(true);
      toast.error(error.message || "Не вдалося отримати знижку.");
    }
  };

  return (
    <>
      <div className='category-block'> Перевірте та підтвердіть ваше замовлення!</div>
      <div className='master-container'>
        <div className="content-block">
          <div className="order-card-body">
            <div className="order-table-num">Ваш стіл  {order.table}</div>

            <div className="summary-card-description">
              {dishKeys.map((dishId) => {
                const dish = order[dishId];
                return (
                  <div className="order-card-item" key={dishId}>
                    <div className="details">
                      <span>{dish.name}:</span>
                      <span><strong>{dish.quantity}</strong> x {dish.price} грн.</span>
                    </div>

                    {dish.additions && Object.keys(dish.additions).length > 0 && (
                      <div className="order-additions">
                        <span>- додатки: (
                          {Object.keys(dish.additions).map((addName) => (
                            <span key={addName}>{addName}:{dish.additions[addName]} грн., </span>
                          ))}
                        )</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="order-card-price">Сума: {order.totalCost} грн.</div>

            <div className="board-title">Маєте купон на знижку?</div>
            <form className="coupon" onSubmit={getCoupon}>
              <input
                id="coupon"
                type="text"
                placeholder="Ваш купон ..."
                className={`input_field ${couponError ? 'error' : ''}`}
                value={couponAccepted ? `Використано: ${couponCode}` : couponCode}
                minLength={10}
                maxLength={10}
                required
                onChange={(e) => {
                  if (!couponAccepted) {
                    const value = e.target.value;
                    if (/^[a-zA-Z0-9]{0,10}$/.test(value)) {
                      setCouponCode(value);
                    } else {
                      toast.warning("Купон має містити 10 символів (латинські літери та цифри).");
                    }
                  }
                }}
                disabled={couponAccepted}
              />
              <button className="board-btn" type="submit" disabled={couponAccepted}>
                Додати
              </button>
            </form>

            <div className="board-title">Розрахована вартість</div>
            <div className="details">
              <span>Вартість без знижки:</span>
              <span>{format(total)} грн.</span>
              <span>Знижка за купоном:</span>
              <span>{format(couponDiscount)} грн.</span>
              <span>Знижка постійного покупця:</span>
              <span>{format(loyaltyDiscount)} грн.</span>
              <span>До сплати:</span>
              <span>{format(payable)} грн.</span>
            </div>

            <div className="checkout--footer">
              <div className="price">{format(payable)}<sub> грн.</sub></div>
              <button onClick={() => goTo(VIEWS.PRODUCT)}className="cancel-btn">Змінити</button>
              <button
                onClick={() => postOrder(loyaltyPercentage, couponPercentage, payable)}
                disabled={loading}
                className="apply-btn"
              >
                {loading ? "Обробка..." : "Підтверджую"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}