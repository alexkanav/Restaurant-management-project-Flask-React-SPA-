import React, { useState } from 'react';
import Form from '../components/Form/Form';
import { register } from '../utils/authUtils';
import { VIEWS } from '../constants/views';


export default function Register({ goTo }) {
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (formData) => {
    const success = await register(formData, setFieldErrors);
    if (success) {
      goTo(VIEWS.LOGIN);
    }
  };

  return (
    <>
      <div className="notice">
        <button className="complete-butt" onClick={() => goTo(VIEWS.LOGIN)}>
          Авторизація
        </button>
      </div>

      <Form
        fields={[
          { name: 'username', label: "Ім'я", type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Пароль', type: 'password' },
          { name: 'confirmPassword', label: 'Підтвердіть пароль', type: 'password' },
        ]}
        name="Реєстрація"
        buttonText="Реєструватись"
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
      />
    </>
  );
}
