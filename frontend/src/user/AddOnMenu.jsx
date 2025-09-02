import { toast } from 'react-toastify';
import { useOrder } from '../context/OrderContext';
import { useDragScroll } from '../hooks/useDragScroll';


export default function AddOnMenu(props) {
  const {
    dishId,
    currentDish,
    addOnMenu,
    dishName,
  } = props;

  const { order, updateAddition } = useOrder();

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDragScroll();

  const selectAddition = (dishId, addition, price) => {
    if (dishId in order) {
      updateAddition(dishId, addition, price);
    } else {
      toast.error(`Спершу додайте страву: ${dishName}`);
    }
  };

  return (
    <div
      className="nav-scroller-add"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {Object.keys(addOnMenu).map((addon) => {
        const isSelected = !!currentDish?.additions?.[addon];
        const isAddOnApplied = Number(currentDish?.quantity) > 0

        const className = [
          'nav-scr-add',
          isAddOnApplied ? 'add-dg-col' : '',
          isSelected ? 'active-button' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={addon}
            className={className}
            onClick={
              isSelected
                ? undefined
                : () => selectAddition(dishId, addon, addOnMenu[addon])
            }
          >
            <div className="card-name-add">{addon}</div>
            <div className="card-price-add">{addOnMenu[addon]} грн.</div>
          </button>
        );

      })}
    </div>
  );
}