import { useOrder } from '../context/OrderContext';


export default function TableSelection({ goTo }) {
  const { addItem } = useOrder();

  const addTableNumber = (num) => {
    addItem("table", num);
    goTo("CreatedOrder")
  };

  return (
    <div className="block-table">
      <h3>Виберіть номер вашого столика</h3>
      {[...Array(10).keys()].map((num) => (
        <button
          key={num}
          className="table-btn"
          onClick={() => addTableNumber(num + 1)}
        >
          {num + 1}
        </button>
      ))}
    </div>
  );
}