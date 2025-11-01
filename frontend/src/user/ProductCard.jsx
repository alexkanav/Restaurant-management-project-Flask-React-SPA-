import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AddOnMenu from './AddOnMenu';
import { sendToServer } from '../utils/api';
import love from '../assets/images/love.jpg';
import star from '../assets/images/star.svg';
import likeW from '../assets/images/likeW.jpg';
import likeB from '../assets/images/likeB.jpg';
import { useOrder } from '../context/OrderContext';
import { imgFolder } from '../../config.json';


export default function ProductCard(props) {
  const { code, name, description, price, image_link, likes, isPop, isRec, extras} = props;
  const { order, updateItem } = useOrder();
  const [likeDish, setLikeDish] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const currentDish = order[code];

  const handleProductQuantity = (event) => {
    const quantity = event.target.value;
    updateItem(code, { name, quantity, price, additions: {} });
  };

  const handleShowDetails = () => {
    setShowDetails(prev => !prev);
  };

  const addLikeToDish = async () => {
    try {
      const { data }  = await sendToServer(`api/dishes/${code}/like`, null, "PATCH");
      setLikeDish(true);
      toast.success(data.message || "Додано вподобання");
    } catch (error) {
      if (error?.status === 401) {
        toast.error("Спочатку замовте страву.");
      } else {
        toast.error(error.message || "Вподобання не додано");
      }
    }
  };

  return (
    <div className="card-wrap">
      <div className="card-box">
        <div className="card-cont">
          <div className="card-name">{name}</div>
          <div className="card-price">
            {price} грн.

            {isPop && (
              <img className="d_icon" src={love} alt="Популярне" />
            )}

            {isRec && (
              <img className="d_icon" src={star} alt="Рекомендуємо" />
            )}

            <img
              className="d_icon_LM"
              src={likeDish ? likeB : likeW}
              alt="Лайк"
              onClick={!likeDish ? addLikeToDish : undefined}
              style={{ cursor: !likeDish ? 'pointer' : 'default' }}
            />
            <span className="num_like_menu">{likes + (likeDish ? 1 : 0)}</span>
          </div>

          <div className="description-collapsed">{description}</div>
        </div>

        <img
          className="card-image"
          src={`${imgFolder}${image_link}`}
          loading="lazy"
          onClick={handleShowDetails}
          alt={name}
        />
      </div>

      <select
        value={currentDish?.quantity ?? "0"}
        className={(currentDish?.quantity && currentDish.quantity !== "0") ? "amount-activ" : "amount"}
        onChange={(event) => {handleProductQuantity(event, code, price)}}
      >
        <option value="0">Замовити</option>
        {[...Array(10).keys()].map((num) => (
          <option key={num + 1} value={num + 1}>
            {num + 1} порц.
          </option>
        ))}
      </select>

      <button onClick={handleShowDetails}>
        {showDetails ? "приховати" : "показати"}
      </button>

      {showDetails && (
        <div className="dish-details">
          <img
            src={`${imgFolder}${image_link}`}
            alt={name}
            onClick={handleShowDetails}
            style={{ width: '100%', marginTop: '10px' }}
          />
          <p>{description}</p>
        </div>
      )}
      {extras && (
          <AddOnMenu
              dishId={code}
              addOnMenu={extras}
              dishName={name}
              currentDish={currentDish}
          />
      )}

    </div>
  );
}
