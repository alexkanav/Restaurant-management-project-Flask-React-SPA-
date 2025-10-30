import DishCategoryEditor from './DishCategoryEditor';
import CouponManager from './CouponManager';

export default function MenuManagement() {

  return (
  <div className="management-content">
    <div className="management-block">
      <div className="management-body">
      <h2 className='m-title'> Оновити меню</h2>
      <DishCategoryEditor />
      </div>
    </div>
    <div className="management-block">
      <h2 className='m-title'>Купони на знижку</h2>
      <CouponManager />
    </div>
  </div>
  );
}