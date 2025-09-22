import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';


export default function OrderBoard({ setSelectedOrder, name }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(false);
  const orderCountRef = useRef(0);

  const loadOrders = async () => {
    try {
      const { data } = await sendToServer('admin/api/orders', null, 'GET');
      setOrders(data.new_orders);
    } catch (error) {
      toast.error(error.message || "Зв'язок з сервером втрачено.");
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await sendToServer('admin/api/orders/count', null, 'GET');
        setStatus(true);
        if (orderCountRef.current !== data.order_number) {
          orderCountRef.current = data.order_number;
          loadOrders();
        }
      } catch (error) {
        setStatus(false);
        if (error.status === 401) {
          toast.error("Ви не авторизовані !!!");
        } else {
          toast.error(error.message || "Зв'язок з сервером втрачено.");
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className='order-note'>
        <span>Користувач: {name}</span>
        <span>
          {status ? (
            <div>Замовлення актуальні</div>
          ) : (
            <div className="error">Помилка оновлення</div>
          )}
        </span>
      </div>
      <div className="order-count">
        Невиконаних замовлень: {orderCountRef.current}
      </div>

      {orders.map((order) => (
        <React.Fragment key={order.id}>
          <button id={`btn-${order.id}`}
            onClick={() => setSelectedOrder(order)}
            className="order-card"
          >
            <div className="order-card-body">
              <div className="order-card-title">
                <span> {order.id}</span>
                <span className="table-num">Стіл  {order.table}</span>
              </div>

              <div className="order-card-description">
                {Object.keys(order.order_details).map((code) => {
                  const item = order.order_details[code];
                  return (
                    <div className="order-card-item" key={code}>
                      <div className="details">
                        <span><strong>{item.name}</strong>: </span>
                        <span><strong>{item.quantity}</strong></span>
                      </div>

                      {item.additions && Object.keys(item.additions).length > 0 && (
                        <div className="order-additions">
                          <span>- додатки: (
                           {Object.keys(item.additions).map((addition) => (
                              <span key={addition}> {addition}, </span>
                            ))}
                          )</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              <div className="order-card-price">{order.final_cost} грн.</div>
            </div>
          </button>
        </React.Fragment>
      ))}
    </>
  );
}