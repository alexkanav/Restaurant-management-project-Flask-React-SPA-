import React, { useState } from "react";
import { toast } from 'react-toastify';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import uk from "date-fns/locale/uk";

registerLocale("uk", uk);

export default function CouponForm({ onSubmit, coupons = [], deactivateCoupon }) {
  const [discount, setDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState(new Date());
  const [isExpires, setIsExpires] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const numDiscount = Number(discount);

    if (isNaN(numDiscount) || numDiscount < 1 || numDiscount > 99) {
      toast.warning("Знижка має бути від 1 до 99%");
      return;
    }

    const expiresAtStr = expiresAt.toLocaleDateString("uk-UA").replace(/[./]/g, "-");

    onSubmit({
      discount_value: numDiscount,
      expires_at: isExpires ? expiresAtStr : null,
    });

    setDiscount("");
    setIsExpires(false);
    setExpiresAt(new Date());
  };

  return (
    <div className="dashboard-container">
      <div className="coupon-list">
        {coupons.length === 0 ? (
          <p className="no-coupons">Немає доступних купонів.</p>
        ) : (
          <table className="coupon-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Код</th>
                <th>Знижка, %</th>
                <th>Термін дії</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td data-label="#">{coupon.id}</td>
                  <td data-label="Код">{coupon.code}</td>
                  <td data-label="Знижка, %">{coupon.discount_value}</td>
                  <td data-label="Термін дії">{coupon.expires_at || "Безстроковий"}</td>
                  <td data-label="Дія">
                    <button
                      className="btn-delete"
                      onClick={() => deactivateCoupon(coupon.id)}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dashboard-form">
        <h3>Створити новий купон</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Процент знижки:
            <input
              type="number"
              placeholder="Число від 1 до 99"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min="1"
              max="99"
              required
            />
          </label>

          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="expires"
                checked={!isExpires}
                onChange={() => setIsExpires(false)}
              />
              Безстроковий
            </label>

            <label>
              <input
                type="radio"
                name="expires"
                checked={isExpires}
                onChange={() => setIsExpires(true)}
              />
              З терміном дії
            </label>
          </div>

          {isExpires && (
            <DatePicker
              selected={expiresAt}
              onChange={(date) => setExpiresAt(date)}
              dateFormat="dd-MM-yyyy"
              locale="uk"
              className="date-picker"
            />
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={!discount || discount < 1 || discount > 99}
          >
            Створити купон
          </button>
        </form>
      </div>
    </div>
  );
}
