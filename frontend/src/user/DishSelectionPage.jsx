import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductViewer from './ProductViewer';
import OrderSummary from './OrderSummary';
import TableSelection from './TableSelection';
import { useOrder } from '../context/OrderContext';
import { VIEWS } from '../constants/views';
import heart from '../assets/images/heart.svg';
import star from '../assets/images/star.svg';
import { sendToServer } from '../utils/api';


export default function DishSelectionPage() {
  const [menuCategories, setMenuCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState({});
  const [currentComponent, setCurrentComponent] = useState(VIEWS.PRODUCT);
  const { addItem, cleanedOrder, calculateTotal } = useOrder();

  const goTo = (view) => setCurrentComponent(view);

  const completeOrder = () => {
    const validOrder = cleanedOrder();
    if (Object.keys(validOrder).length === 0) {
      toast.error("Ваше замовлення порожнє.");
      return;
    }

    const totalCost = calculateTotal();
    addItem("totalCost", totalCost);
    goTo(VIEWS.TABLE);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await sendToServer("api/menu", null, "GET");

        if (data.menu && data.menu.categories && data.menu.dishes) {
          setMenuCategories(data.menu.categories.map((item) => Object.keys(item)[0]));
          setCategoryItems(data.menu.categories.map((item) => Object.values(item)[0]));
          setAllMenuItems(data.menu.dishes);
        } else {
          throw new Error("Menu data is incomplete");
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        toast.error("Помилка завантаження меню.");
      }
    };
    fetchMenu();
  }, []);

  if (!menuCategories.length || !categoryItems.length || !Object.keys(allMenuItems).length) {
    return <div className="loading">Завантажую меню із сервера...</div>
  }

  const COMPONENTS = {
    [VIEWS.PRODUCT]: (
      <>
        <ProductViewer
          menuCategories={menuCategories}
          categoryItems={categoryItems}
          allMenuItems={allMenuItems}
        />
        <div className="button-wrapper">
          <button className="order-button" onClick={completeOrder}>
            Завершити замовлення
          </button>
        </div>
      </>
    ),
    [VIEWS.TABLE]: <TableSelection goTo={goTo} />,
    [VIEWS.SUMMARY]: <OrderSummary goTo={goTo} />,
  };

  const navLinks = (currentComponent === VIEWS.PRODUCT)
    ? [
        { to: `#category_${menuCategories.length - 2}`, src: heart, alt: 'Популярні страви', name: 'Популярне' },
        { to: `#category_${menuCategories.length - 1}`, src: star, alt: 'Рекомендовані страви', name: 'Рекомендуємо' },
      ]
    : [];

  return (
    <>
      <Header navLinks={navLinks} />
      <div className="content">
        {COMPONENTS[currentComponent]}
      </div>
      <Footer />
    </>
  );
}
