import DishCategoryEditor from './DishCategoryEditor';


export default function MenuManagement() {

  return (
    <div className="content-block">
      <div className="order-card-body">
      <p className='m-title'> Оновити меню</p>

      <DishCategoryEditor />
      </div>
    </div>
  );
}