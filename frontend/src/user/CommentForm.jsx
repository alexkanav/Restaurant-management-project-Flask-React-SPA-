import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';

export default function CommentForm() {
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [formData.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.trim() === '' || formData.message.trim() === '') {
      toast.warn('Будь ласка, заповніть усі поля.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await sendToServer('api/send-comment', formData, 'POST');
      toast.success(data.message || 'Дякуємо за відгук!');
      setFormData({ name: '', message: '' });
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      if (error?.status === 401) {
        toast.error("Ви не авторизовані.");
        navigate('/');
      } else {
        toast.error(error.message || "Помилка під час відправки. Спробуйте пізніше.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="comment">
        Залиште, будь ласка, свій відгук, що сподобалося і що нам слід виправити.
      </p>
      <hr className="custom-hr" />

      <div className="container">
        <form className="register-form" onSubmit={handleSubmit}>

          <div className="form-name">
            <label htmlFor="name">Ваше Ім'я: </label>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={20}
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <label htmlFor="message">Ваш відгук:</label>
          <div className="table-textarea">
            <textarea
              id="message"
              name="message"
              maxLength={500}
              ref={textareaRef}
              value={formData.message}
              onChange={handleChange}
              rows={1}
              placeholder="Ваш відгук ..."
              disabled={loading}
            />
          <small className="count">Використано: {formData.message.length}/500</small>
          </div>

          <button className="complete-butt" type="submit" disabled={loading}>
            {loading ? 'Відправка...' : 'Відправити'}
          </button>

        </form>
      </div>
    </>
  );
}
