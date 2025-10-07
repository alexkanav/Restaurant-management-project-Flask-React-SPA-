import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sendToServer } from '../utils/api';
import Form from '../components/Form/Form';


export default function CommentForm() {
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await sendToServer('api/send-comment', formData, 'POST');
      toast.success(data.message || 'Дякуємо за відгук!');
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
      <div className="category-block">
        Залиште, будь ласка, свій відгук.
      </div>

      <Form
        fields={[
          { name: 'username', type: 'text', placeholder: "Ім'я", required: true, maxLength: 20},
          { name: 'textarea', type: 'textarea', placeholder: "Ваш відгук ...", required: true, maxLength: 500 },
        ]}
        title="Відгуки"
        buttonText="Надіслати"
        onSubmit={handleSubmit}
        loading={loading}
        fieldErrors={fieldErrors}
      />
    </>
  );
}
