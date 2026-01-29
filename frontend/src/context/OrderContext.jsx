import { createContext, useContext, useState } from 'react';


const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orderDetails, setOrderDetails] = useState({});


   // Add item in the order
  const addItem = (item, itemData) => {
    setOrderDetails(prev => ({
      ...prev,
      [item]: itemData
    }));
  };

  // Update item in the order
  const updateItem = (dishId, itemData) => {
      setOrderDetails(prev => ({
        ...prev,
        [dishId]: {
          ...prev[dishId],
          ...itemData
        }
      }));
    };

  // Update addition
  const updateAddition = (dishId, addition, price) => {
    setOrderDetails(prev => {
      const existingDish = prev[dishId] || {};
      const existingAdditions = existingDish.additions || {};

      return {
        ...prev,
        [dishId]: {
          ...existingDish,
          additions: {
            ...existingAdditions,
            [addition]: price
          }
        }
      };
    });
  };

  // Calculate the total price of the order
  const calculateTotal = () => {
    return Object.values(orderDetails).reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const additions = item.additions || {};
      const additionsTotal = Object.values(additions).reduce((a, b) => a + Number(b), 0);
      return sum + (quantity * price + additionsTotal);
    }, 0);
  };

  // Filter out items with quantity <= 0
  const cleanedOrder = () => {
    const validOrder = Object.fromEntries(
      Object.entries(orderDetails).filter(
        ([, value]) => Number(value.quantity) > 0
      )
    );
    if (Object.keys(orderDetails).length !== Object.keys(validOrder).length) {
      setOrderDetails(validOrder)
    }
    return validOrder;
  };

  const clearOrder = () => setOrderDetails({});

  return (
    <OrderContext.Provider
      value={{
        orderDetails,
        addItem,
        updateItem,
        updateAddition,
        calculateTotal,
        cleanedOrder,
        clearOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
