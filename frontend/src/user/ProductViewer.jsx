import React, { useState, useEffect, useRef} from 'react';
import Cookies from 'js-cookie';
import ProductCard from './ProductCard'
import DragScrollMenu from './DragScroll/DragScrollMenu'
import { sendToServer } from '../utils/api';


export default function ProductViewer() {
  const [userId, setUserId] = useState(() => Cookies.get('user_id'));
  const [cards, setCards] = useState({});
  const [updateOrderItem, setUpdateOrderItem] = useState(false);


  // Fetch user ID if not in cookie
  useEffect(() => {
    if (userId !== undefined) return;

    const fetchUserId = async () => {
      try {
        const data = await sendToServer("user-id", null, "GET");
        const fetchedUserId = data?.userId ?? 0;

        Cookies.set('user_id', fetchedUserId, { expires: 30 });
        setUserId(fetchedUserId);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, [userId]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await sendToServer("cards", null, "GET");
        setCards(data);
      } catch (error) {
        console.error("Error get cards:", error);
      }
    };

    fetchCards();
  }, []);


  const updateProduct = () => {setUpdateOrderItem(prev => !prev);};


  const categories = cards.menu ? Object.keys(cards.menu): [];

   return (
  <>
    <DragScrollMenu categories={categories} />

    {cards.menu ? (
      Object.keys(cards.menu).map((category, index) => {
        return (
          <div key={category}>
            <div id={`category_${index}`} className="category-block">
              {category}
            </div>
            {cards.menu[category].map((dish, dishIndex) => {
              const isPop =
                cards.menu.Популярне?.includes(dish) || false;
              const isRec =
                cards.menu.Рекомендуємо?.includes(dish) || false;
             const addOnMenu = Object.hasOwn(cards.addOnMenu, dish)
                ? cards.addOnMenu[dish]
                : null;

              return (
                <ProductCard
                  key={`${category}-${dishIndex}`}
                  dishId={dish}
                  isPop={isPop}
                  isRec={isRec}
                  addOnMenu={addOnMenu}
                  dishAttributes={cards.dish_attributes[dish]}
                  price={cards.price[dish]}
                  updateProduct={updateProduct}
                />
              );
            })}
          </div>
        );
      })
    ) : (
      <div>Loading...</div>
    )}
  </>  );
}

