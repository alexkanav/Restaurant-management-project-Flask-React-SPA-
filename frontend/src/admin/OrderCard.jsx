import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';


export default function OrderCard({ selectedOrder, setSelectedOrder }) {
  const finalizeOrder = async () => {
    try {
      const { data } = await sendToServer(`admin/api/orders/${selectedOrder.id}/complete`, null, 'POST');
      toast.success(data.message || "Замовлення виконано");
      setSelectedOrder(null);
    } catch (error) {
      toast.error(error.message || "Замовлення скасовано");
    }
  };

  return (
    <>
      <div className='category-block'> Виконане замовлення!</div>
      <div className='master-container'>
        <div className="checkout">
          <div className="order-card-body">
            <div className="order-card-title">
              <span> #{selectedOrder.id}</span>
              <span className="table-num">Стіл  {selectedOrder.table}</span>
            </div>
            <div className="summary-card-description">
              {Object.keys(selectedOrder.order_details).map((code) => {
              const dish = selectedOrder.order_details[code];
                return (
                  <div className="order-card-item" key={code}>
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
                  )
                })}
              </div>

            <div className="board-title">Розрахована вартість</div>
              <div className="details">
                <span>Вартість без знижки:</span>
                <span> {selectedOrder.original_cost} грн.</span>
                <span>Знижка за купоном:</span>
                <span> {selectedOrder.coupon_pct} %</span>
                <span>Знижка постійного покупця:</span>
                <span> {selectedOrder.loyalty_pct} %</span>
                <span>До сплати:</span>
                <span> {selectedOrder.final_cost} грн.</span>
              </div>

              <div className="checkout--footer">
                <div className="price">{selectedOrder.final_cost}<sub> грн.</sub></div>
                <button  onClick={() => setSelectedOrder(null)} className="cancel-btn">Скасувати</button>
                <button onClick={finalizeOrder} className="apply-btn">Підтверджую</button>
              </div>
          </div>
        </div>
      </div>
    </>
  )
}