import { useOrder } from '../context/OrderContext';


export default function OrderDetail() {
  const { order} = useOrder();

  const dishKeys = Object.keys(order).filter(
    key => key !== 'table' && key !== 'totalCost'
  );

  return (
    <>
      <h4>Ваш столик {order.table}</h4>
      <hr />

      {dishKeys.map((dishId) => {
        const dish = order[dishId];
        return (
          <div key={dishId} className="order-text">
            <div>
              - {dish.name} в кількості: {dish.quantity}
            </div>
            <div className="text-block">
              {Object.keys(dish.additions).map((addName) => (
                 <span key={addName}>{addName} </span>
              ))}
            </div>
          </div>
        )
        }
      )}
      <hr />
      <h3>Ваше замовлення на суму: {order.totalCost} грн.</h3>
    </>
  )
}