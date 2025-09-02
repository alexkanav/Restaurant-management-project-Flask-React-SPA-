import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import  OrderDetails from './OrderDetails';
import { useOrder } from '../context/OrderContext';
import { VIEWS } from '../constants/views';
import { fetchOrCreateUser } from '../utils/authUtils';


export default function OrderSummary({ goTo }) {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const { order } = useOrder();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await fetchOrCreateUser();
        if (userId) {
          setUserId(userId);
        } else {
          toast.error("Ви не зареєстровані, можливо, у вашому браузері блокуються cookie.");
        }
      } catch (error) {
        toast.error(error.message || "Не вдалося отримати дані користувача.");
      }
    };

    fetchUserId();
  }, []);

  const postOrder = async () => {
    if (!userId) {
      toast.error("Не вдалося отримати ID користувача.");
      return;
    }

    if (!order) {
      toast.error("Немає замовлення для відправки.");
      return;
    }

    try {
      const { data } = await sendToServer("api/order", order, "POST");
      setOrderId(data.id);
      toast.success(data.message || "Замовлення успішно відправлено!");
    } catch (error) {
      toast.error(error.message || "Замовлення не надіслано.");
    }
  };

  return (
    <div className="popup">
      {orderId && (
        <>
          <div className="success-message">
            Дякуємо. Ваше замовлення #{orderId} прийнято і буде виконане через - 20 хвилин.
          </div>
          <div className="text-block">
            (Час виконання замовлення розраховується автоматично відповідно до вибраних вами страв)
          </div>
          <hr />
        </>
      )}

      <OrderDetails />

      <div className="button-group">
        {orderId ? (
          <>
            <button className="cancel-butt" onClick={() => navigate('/')}>Вийти</button>
            <button className="complete-butt" onClick={() => navigate('/feedback')}>Залишити відгук</button>
          </>
        ) : (
          <>
            <button className="cancel-butt" onClick={() => goTo(VIEWS.PRODUCT)}>Змінити замовлення</button>
            <button
              className="complete-butt"
              onClick={postOrder}
              disabled={!order || orderId}
            >
              Підтверджую
            </button>
          </>
        )}
      </div>
    </div>
  );
}