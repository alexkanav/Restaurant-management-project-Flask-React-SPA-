import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';


export default function OrderCard({ selectedOrder, setSelectedOrder }) {
  const finalizeOrder = async () => {
    try {
      const { data } = await sendToServer(`/admin/api/orders/${selectedOrder.id}/complete`, null, 'POST');
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
        <div className="content-block">
          <div className="order-card-body">
            <div className="order-card-title">
              <span> #{selectedOrder.id}</span>
              <span className="table-num">Стіл  {selectedOrder.table}</span>
            </div>
            <div className="summary-card-description">
              {Object.keys(selectedOrder.order_details).map((code) => {
              const { name, quantity, price, additions } = selectedOrder.order_details[code];
                return (
                  <div className="order-card-item" key={code}>
                    <div className="details">
                      <span>{name}:</span>
                      <span className="no-wrap-text"><strong>{quantity}</strong> x {price} грн.</span>
                    </div>

                    {additions && Object.keys(additions).length > 0 && (
                      <div className="order-additions">
                        <span>- додатки: (
                          {Object.keys(additions).map((addName) => (
                            <span key={addName}>{addName}:{additions[addName]} грн., </span>
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
                <span className="no-wrap-text"> {selectedOrder.original_cost} грн.</span>
                <span>Знижка за купоном:</span>
                <span className="no-wrap-text"> {selectedOrder.coupon_pct} %</span>
                <span>Знижка постійного покупця:</span>
                <span className="no-wrap-text"> {selectedOrder.loyalty_pct} %</span>
                <span>До сплати:</span>
                <span className="no-wrap-text"> {selectedOrder.final_cost} грн.</span>
              </div>
              <div className="price">{selectedOrder.final_cost}<sub> грн.</sub></div>
              <div className="checkout--footer">
                <button  onClick={() => setSelectedOrder(null)} className="cancel-btn">Скасувати</button>
                <button onClick={finalizeOrder} className="apply-btn">Підтверджую</button>
              </div>
          </div>
        </div>
      </div>
    </>
  )
}