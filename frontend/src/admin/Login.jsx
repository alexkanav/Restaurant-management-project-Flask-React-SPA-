import React, { useState, useEffect } from 'react';
import Form from '../components/Form/Form';
import { login } from '../utils/authUtils';
import { VIEWS } from '../constants/views';


export default function Login({ userName, setUserName, goTo }) {
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (userName !== '') {
      goTo(VIEWS.DASHBOARD);
    }
  }, [userName]);

  const handleSubmit = async (formData) => {
    const newErrors = {};
    await login(formData, setUserName, setFieldErrors);
  };

  return (
    <>
      <div className="notice">
        <button className="complete-butt" onClick={() => goTo(VIEWS.REGISTER)}>
          Реєстрація
        </button>
      </div>

      <Form
        fields={[
          { name: 'email', label: 'Ваш Email', type: 'email' },
          { name: 'password', label: 'Пароль', type: 'password' },
        ]}
        name="Авторизація"
        buttonText="Увійти"
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
      />
    </>
  );
}
