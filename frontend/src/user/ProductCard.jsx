import React, { useState, useRef } from 'react';
import AddOnMenu from './AddOnMenu'
import { sendToServer } from '../utils/api';
import love from '../assets/images/love.jpg';
import star from '../assets/images/star.svg';
import likeW from '../assets/images/likeW.jpg';
import likeB from '../assets/images/likeB.jpg';
import { useOrder } from '../context/OrderContext';


export default function ProductCard(props) {
    const { order, updateItem } = useOrder();

  const { dishId, dishAttributes, price, isPop, isRec,  createdOrder, addOnMenu, updateProduct } = props;
  const [likeDish, setLikeDish] = useState(true);
  let currentDish = order[dishId]
  const handleProductQuantity = (event, dishId, price) => {
    updateItem(dishId, {name: dishAttributes.name, quantity: event.target.value, price: price, additions: {}})
    updateProduct();
  }

  const [showDetails, setShowDetails] = useState(false);

  const handleShowDetails = () => {
    setShowDetails(prev => !prev);
  };

  const addLikeToDish = async () => {
    try {
      const data = await sendToServer("add-like", {dishId}, "POST");
      setLikeDish(false);
    } catch (error) {
        console.error('Error liking dish:', error);
      }
  };

  return (
    <div className="card-wrap">
      <div className="card-box">
        <div className="card-cont">
          <div className="card-name">{dishAttributes.name}</div>
          <div className="card-price">
            {price} грн.

            {isPop && (
              <img className="d_icon" src={love} alt="Популярне" />
            )}

            {isRec && (
              <img className="d_icon" src={star} alt="Рекомендуємо" />
            )}

            {likeDish ? (
              <>
                <img
                  className="d_icon_LM"
                  src={likeW}
                  alt="Лайк"
                  onClick={addLikeToDish}
                />
                <span className="num_like_menu">{dishAttributes.likes}</span>
              </>
            ) : (
              <>
                <img className="d_icon_LM" src={likeB} alt="Лайк" />
                <span className="num_like_menu">{dishAttributes.likes + 1}</span>
              </>
            )}
          </div>

          <div className="card-descr">{dishAttributes.description}</div>
        </div>

        <img
          className="card-image"
          src={`/${dishAttributes.image_link}`}
          loading="lazy"
          onClick={handleShowDetails}
          alt={dishAttributes.name}
        />
      </div>

      <select
        id="number-select"
         value={currentDish?.quantity ?? "0"}

        className={(currentDish?.quantity && currentDish.quantity !== "0") ? "amount-activ" : "amount"}
        onChange={(event) => {handleProductQuantity(event, dishId, price)}}
      >
        <option value="0">Замовити</option>
        {[...Array(10).keys()].map((num) => (
          <option key={num + 1} value={num + 1}>
            {num + 1} порц.
          </option>
        ))}
      </select>

      <button onClick={handleShowDetails}>
        {showDetails ? 'приховати' : 'показати'}
      </button>

      {showDetails && (
        <div>
          <img
            src={`/${dishAttributes.image_link}`}
            alt={dishAttributes.name}
            onClick={handleShowDetails}
            style={{ width: '100%', marginTop: '10px' }}
          />
          <p>{dishAttributes.description}</p>
        </div>
      )}

      {addOnMenu && (
          <AddOnMenu
              dishId={dishId}
              addOnMenu={addOnMenu}
              dishName={dishAttributes.name}
              createdOrder={createdOrder}
              updateProduct={updateProduct}
              currentDish={currentDish}
          />
      )}

    </div>
  );

};
