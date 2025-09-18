import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import  OrderDetails from './OrderDetails';
import { useOrder } from '../context/OrderContext';
import { VIEWS } from '../constants/views';
import { fetchOrCreateUser } from '../utils/authUtils';
import { getUserDiscount } from '../utils/userUtils';


export default function OrderSummary({ goTo }) {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const { order } = useOrder();
  const [userId, setUserId] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserIdAndDiscount = async () => {
      try {
        const userId = await fetchOrCreateUser();

        if (!userId) {
          toast.error("Ви не зареєстровані.");
          return;
        }

        setUserId(userId);

        const discountValue = await getUserDiscount();
        setDiscount(discountValue);

      } catch (error) {
        toast.error("Не вдалося отримати дані користувача або знижку.");
      }
    };

    fetchUserIdAndDiscount();
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

     setLoading(true);

    try {
      const { data } = await sendToServer("api/order", order, "POST");
      setOrderId(data.id);
      toast.success(data.message || "Замовлення успішно відправлено!");
    } catch (error) {
      toast.error(error.message || "Замовлення не надіслано.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId)
    return (
      <div className='warning-message'>
        <h3>Ви не зареєстровані, можливо, у вашому браузері блокуються cookie.</h3>
        <hr/>
        <p>Cпробуйте перевірити ваше інтернет-з'єднання. Якщо проблема не зникає, очистіть кеш браузера, спробуйте інший пристрій.</p>
      </div>
    )

  return (
    <div className="order-summary">
      {orderId ? (
        <>
          <div className="category-block">Дякуємо. Ваше замовлення #{orderId} прийнято.</div>
          <div className="ord-container">
            <div>Орієнтовний час для виконання замовлення - 20 хвилин.</div>

            <div className="text-block">
            (Час виконання замовлення розраховується автоматично)
            <hr />

              <div className="btn-block">
                  <button className="cancel-btn" onClick={() => navigate('/')}>Вийти</button>
                  <button className="apply-btn" onClick={() => navigate('/feedback')}>Залишити відгук</button>
              </div>
          </div>
        </>
      ) : (
        <OrderDetails discount={discount} goTo={goTo} postOrder={postOrder} loading={loading}/>
      )}
    </div>
  )
}