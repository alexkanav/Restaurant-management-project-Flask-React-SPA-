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
  const [loyaltyPercentage, setLoyaltyPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leadTime, setLeadTime] = useState(20);


  useEffect(() => {
    const fetchUserIdAndLoyaltyPercentage = async () => {
      try {
        const userId = await fetchOrCreateUser();

        if (!userId) {
         setError("Ви не зареєстровані.");
         return;
        }

        setUserId(userId);

        const discountValue = await getUserDiscount();
        setLoyaltyPercentage(discountValue);

      } catch (error) {
        setError("Не вдалося отримати дані користувача або знижку.");
      }
    };

    fetchUserIdAndLoyaltyPercentage();
  }, []);

  const postOrder = async (loyaltyPercentage, couponPercentage, payable) => {
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
      const { data } = await sendToServer("api/order", {...order, loyaltyPercentage, couponPercentage, payable}, "POST");
      setOrderId(data.id);
      setLeadTime(data.leadTime)
      toast.success(data.message || "Замовлення успішно відправлено!");
    } catch (error) {
      toast.error(error.message || "Замовлення не надіслано.");
    } finally {
      setLoading(false);
    }
  };

  if (error)
    return (
      <div className='warning-message'>
        <h3>{error} Можливо, у вашому браузері блокуються cookie</h3>
        <hr/>
        <p>
          Cпробуйте перевірити ваше інтернет-з'єднання.
          Якщо проблема не зникає, очистіть кеш браузера, спробуйте інший пристрій.
        </p>
      </div>
    )

  return (
    <div className="order-summary">
      {orderId ? (
        <>
          <div className="category-block">Дякуємо. Ваше замовлення #{orderId} прийнято.</div>
          <div className="master-container">
          <div className="ord-container">
            <div className="ord-hdr">
              Орієнтовний час для виконання замовлення - <strong>{leadTime}</strong>  хвилин.
            </div>
            <div className="text-block">(Час виконання розраховується автоматично)</div>
            <hr />

            <div className="btn-block">
                <button className="cancel-btn" onClick={() => navigate('/')}>Вийти</button>
                <button className="apply-btn" onClick={() => navigate('/feedback')}>Залишити відгук</button>
            </div>
          </div>
          </div>
        </>
      ) : (
        <OrderDetails
         loyaltyPercentage={loyaltyPercentage}
         goTo={goTo}
         postOrder={postOrder}
         userId={userId}
         loading={loading}
        />
      )}
    </div>
  );
}
