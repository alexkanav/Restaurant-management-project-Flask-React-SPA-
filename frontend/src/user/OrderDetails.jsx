import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { VIEWS } from '../constants/views';


export default function OrderDetails({ discount,  goTo, postOrder, loading }) {

  const { order} = useOrder();
  const total = order.totalCost ?? 0;

  const loyaltyDiscount = total * discount;
  const totalDiscount = loyaltyDiscount;
  const payable = total - totalDiscount;

  const format = (num) => num.toFixed(2);

  const dishKeys = Object.keys(order).filter(
    key => key !== 'table' && key !== 'totalCost'
  );

  return (
    <>
    <div className='category-block'> Перевірте та підтвердіть ваше замовлення!</div>

    <div className='master-container'>

      <div className="checkout">
        <div className="order-card-body">

          <div className="order-table-num">Ваш стіл  {order.table}</div>

          <div className="summary-card-description">
            {dishKeys.map((dishId) => {
              const dish = order[dishId];
              return (
                <div className="order-card-item" key={dishId}>

                  <div className="details">
                    <span>{dish.name}:</span>
                    <span><strong>{dish.quantity}</strong> x {dish.price} грн.</span>
                  </div>

                  {dish.additions && Object.keys(dish.additions).length > 0 && (
                    <div className="order-additions">
                      <span>- додатки: (
                        {Object.keys(dish.additions).map((addName) => (
                          <span key={addName}>{addName}:{dish.additions[addName]} грн. , </span>
                        ))}
                      )</span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <div className="order-card-price">Сума: {order.totalCost} грн.</div>

        <div className="board-title">Розрахована вартість</div>
          <div className="details">
            {order.totalCost !== undefined && order.totalCost !== null ? (() => {

              return (
                <>
                  <span>Вартість без знижки:</span>
                  <span>{format(total)} грн.</span>

                  <span>Знижка постійного покупця:</span>
                  <span>{format(loyaltyDiscount)} грн.</span>

                  <span>До сплати:</span>
                  <span>{format(payable)} грн.</span>
                </>
              );
            })() : (
              <>
                <span>Вартість без знижки:</span>
                <span>0.00 грн.</span>

                <span>Знижка постійного покупця:</span>
                <span>0.00 грн.</span>

                <span>До сплати:</span>
                <span>0.00 грн.</span>
              </>
            )}
          </div>

          <div className="checkout--footer">
            <div className="price">{format(payable)}<sub> грн.</sub></div>
            <button onClick={() => goTo(VIEWS.PRODUCT)}className="cancel-btn">Змінити</button>
            <button
              onClick={postOrder}
              disabled={loading}
              className="apply-btn"
            >
              Підтверджую
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}