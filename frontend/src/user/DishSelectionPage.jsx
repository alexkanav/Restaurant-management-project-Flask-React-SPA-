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
  const [currentComponent, setCurrentComponent] = useState(VIEWS.PRODUCT);
  const { order, addItem, cleanedOrder, calculateTotal } = useOrder();
  const [orderMenu, setOrderMenu] = useState(null);

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
        setOrderMenu(data.menu);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenu();
  }, []);

  // Handle loading
  if (!orderMenu) {
    return <div className="loading">Loading...</div>;
  }

  // Prepare derived data after loading
  const menuCategories = orderMenu.categories.map((item) => Object.keys(item)[0]);
  const categoryItems = orderMenu.categories.map((item) => Object.values(item)[0]);
  const popular = `#category_${menuCategories.length - 2}`;
  const recommended = `#category_${menuCategories.length - 1}`;
  const allMenuItems = orderMenu.dishes
  const COMPONENTS = {
    [VIEWS.PRODUCT]: (
      <>
        <ProductViewer menuCategories={menuCategories} categoryItems={categoryItems} allMenuItems={allMenuItems} />
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

  const navLinks = [
    { to: popular, src: heart, alt: 'Популярні страви', name: 'Популярне' },
    { to: recommended, src: star, alt: 'Рекомендовані страви', name: 'Рекомендуємо' },
  ];

  return (
    <>
      <Header navLinks={navLinks} />
      {COMPONENTS[currentComponent]}
      <Footer />
    </>
  );
}
