import React, { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { VIEWS } from '../constants/views';
import { config } from '../config';


export default function TableSelection({ goTo, setTableNumber }) {
  const { addItem } = useOrder();

  const addTableNumber = (num) => {
    setTableNumber(num);
    goTo(VIEWS.SUMMARY);
  };

  return (
    <div className="block-table">
      <h3>Виберіть номер вашого столика</h3>

      {config?.AVAILABLE_TABLES?.length ? (
        config.AVAILABLE_TABLES.map((num) => (
          <button
            key={num}
            className="table-btn"
            onClick={() => addTableNumber(num)}
          >
            {num}
          </button>
        ))
      ) : (
        <p>Немає доступних столиків.</p>
      )}
    </div>
  );
}
