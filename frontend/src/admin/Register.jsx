import React, { useState } from 'react';
import { Form } from '../components';
import { register } from '../utils/authUtils';
import { VIEWS } from '../constants/views';


export default function Register({ goTo }) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      const success = await register(formData, setFieldErrors);
      if (success) {
        goTo(VIEWS.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <Form
        fields={[
          { name: 'username', type: 'text', placeholder: "Ім'я", required: true, maxLength: 20 },
          { name: 'email', type: 'email', placeholder: 'Email', required: true, maxLength: 20 },
          { name: 'password', type: 'password', placeholder: "Пароль", required: true, maxLength: 20 },
          { name: 'confirmPassword', type: 'password', placeholder: "Підтвердіть пароль", required: true, maxLength: 20 },
        ]}
        title="Реєстрація"
        buttonText="Реєструватись"
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
        loading={loading}
        note={
          <p className="form-note">
            Маєте акаунт?
            <button className="m-btn" type="button" onClick={() => goTo(VIEWS.LOGIN)}>
              Авторизація
            </button>
          </p>
        }
      />
  );
}
