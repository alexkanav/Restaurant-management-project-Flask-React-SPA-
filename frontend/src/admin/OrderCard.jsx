import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';


export default function OrderCard({ selectedOrder, setSelectedOrder }) {
  const clearOrder = async () => {
    try {
      const { data } = await sendToServer(`admin/api/orders/${selectedOrder.id}/complete`, null, 'POST');
      toast.success(data.message || "Замовлення виконано");
      setSelectedOrder(null);
    } catch (error) {
      toast.error(error.message || "Замовлення скасовано");
    }
  };

  return (
    <div className="popup">
      <div>{selectedOrder.id}</div>
      <h4>Ваш столик {selectedOrder.table}</h4>
      <hr />

      {Object.keys(selectedOrder.order_details).map((code) => {
        const dish = selectedOrder.order_details[code];
        return (
          <div key={code} className="order-text">
            <div>
               {dish.name} в кількості: {dish.quantity}
            </div>
            <div className="text-block">
              {Object.keys(dish.additions).map((addName) => (
                 <span key={addName}> - {addName} </span>
              ))}
            </div>
          </div>
        )
      })}

      <hr />
      <h3>Ваше замовлення на суму: {selectedOrder.order_sum} грн.</h3>

      <button onClick={() => setSelectedOrder(null)} className="cancel-butt" >Повернутись</button>
      <button onClick={clearOrder} className="complete-butt" >Підтверджую</button>

    </div>
  )
}