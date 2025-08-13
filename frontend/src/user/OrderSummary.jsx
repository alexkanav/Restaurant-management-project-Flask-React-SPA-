import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import  OrderDetails from './OrderDetails';
import { useOrder } from '../context/OrderContext';


export default function OrderSummary({ goTo }) {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const { order } = useOrder();

  const postOrder = async () => {
    try {
      const data = await sendToServer("order", order, "POST");
      setOrderId(data.id);
      toast.success(data.processed, { autoClose: 2000 });
    } catch (error) {
      toast.error("Помилка під час відправки. Спробуйте ще раз.");
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
            <button className="cancel-butt" onClick={() => goTo("ProductViewer")}>Змінити замовлення</button>
            <button className="complete-butt" onClick={postOrder}>Підтверджую</button>
          </>
        )}
      </div>
    </div>
  );
}