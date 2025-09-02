import { useOrder } from '../context/OrderContext';
import { VIEWS } from '../constants/views';
import {tablesAvailable} from '../../config.json';

export default function TableSelection({ goTo }) {
  const { addItem } = useOrder();

  const addTableNumber = (num) => {
    addItem("table", num);
    goTo(VIEWS.SUMMARY)
  };

  return (
    <div className="block-table">
      <h3>Виберіть номер вашого столика</h3>

      {tablesAvailable.map((num) => (
        <button
          key={num}
          className="table-btn"
          onClick={() => addTableNumber(num)}
        >
          {num}
        </button>
      ))}

    </div>
  );
}