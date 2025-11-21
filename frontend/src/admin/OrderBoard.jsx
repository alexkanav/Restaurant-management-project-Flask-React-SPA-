import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import { config } from '../config';


export default function OrderBoard({ setSelectedOrder, name }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(false);
  const [uncompletedOrderCount, setUncompletedOrderCount] = useState("");

  const orderCountRef = useRef(0);

  const loadOrders = async () => {
    try {
      const { data } = await sendToServer('/admin/api/orders', null, 'GET');
      setOrders(data.new_orders);
      setUncompletedOrderCount(data.uncompleted_order_count);
    } catch (error) {
      toast.error(error.message || "Зв'язок з сервером втрачено.");
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await sendToServer('/admin/api/orders/count', null, 'GET');
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
    }, config.ORDER_POLL_INTERVAL);

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
        Невиконаних замовлень: {uncompletedOrderCount}
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
                  const { name, quantity, additions } = order.order_details[code];
                  return (
                    <div className="order-card-item" key={code}>
                      <div className="details">
                        <span><strong>{name}</strong>: </span>
                        <span><strong>{quantity}</strong></span>
                      </div>

                      {additions && Object.keys(additions).length > 0 && (
                        <div className="order-additions">
                          <span>- додатки: (
                           {Object.keys(additions).map((extra) => (
                              <span key={extra}> {extra}, </span>
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