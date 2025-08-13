import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductViewer from './ProductViewer';
import OrderSummary from './OrderSummary';
import TableSelection from './TableSelection';
import { useOrder } from '../context/OrderContext';


const VIEWS = {
  PRODUCT: 'ProductViewer',
  TABLE: 'TableSelection',
  SUMMARY: 'CreatedOrder',
};

export default function DishSelectionPage() {
  const [currentComponent, setCurrentComponent] = useState(VIEWS.PRODUCT);
  const { order, addItem, cleanedOrder, calculateTotal } = useOrder();

  const goTo = (view) => setCurrentComponent(view);

  const completeOrder = () => {
    // Remove items with 0 quantity
    const validOrder = cleanedOrder();
      if (Object.keys(validOrder).length === 0) {
        toast.error("Ваше замовлення порожнє.");
        return;
      }

    // Calculate total cost and switch view
    const totalCost = calculateTotal();
    addItem("totalCost", totalCost);
    goTo(VIEWS.TABLE);
  };

   const COMPONENTS = {
    [VIEWS.PRODUCT]: (
      <>
        <ProductViewer />
        <div className="complete-order-button-wrapper">
          <button  className="order-button" onClick={completeOrder}>Завершити замовлення</button>
        </div>
      </>
    ),
    [VIEWS.TABLE]: <TableSelection goTo={goTo} />,
    [VIEWS.SUMMARY]: <OrderSummary goTo={goTo} />,
  };


 return (
    <>
      <Header />
      {COMPONENTS[currentComponent]}
      <ToastContainer position="top-center" autoClose={3000} />
      <Footer />
    </>
  );
}