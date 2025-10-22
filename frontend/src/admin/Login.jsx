import React, { useState, useEffect } from 'react';
import { Form } from '../components';
import { login } from '../utils/authUtils';
import { VIEWS } from '../constants/views';


export default function Login({ userName, setUserName, goTo }) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userName !== '') {
      goTo(VIEWS.DASHBOARD);
    }
  }, [userName, goTo]);

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      await login(formData, setUserName, setFieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
      <Form
        fields={[
          { name: 'email', type: 'email', placeholder: 'Email', required: true, maxLength: 20},
          { name: 'password', type: 'password', placeholder: 'Пароль', required: true, maxLength: 20},
        ]}
        title="Авторизація"
        buttonText="Логін"
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
        loading={loading}
        note={
          <p className="form-note">
            Немає акаунту?
            <button className="m-btn" type="button" onClick={() => goTo(VIEWS.REGISTER)}>
              Реєстрація
            </button>
          </p>
        }
      />
  );
}
