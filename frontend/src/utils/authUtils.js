import { toast } from 'react-toastify';
import { sendToServer } from './api';


const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleError = (error, setFieldErrors) => {
  if (error?.status === 401) {
    toast.error(error.message || "Не вірний Логін або Пароль!");
  } else {
    toast.error(error.message || "Помилка з'єднання з сервером.");
  }
  setFieldErrors({});
};

export async function login(credentials, setUserName, setFieldErrors) {
  const newErrors = {};

  if (!validateEmail(credentials.email)) {
    newErrors.email = 'Некоректна електронна пошта';
  }

  if (Object.keys(newErrors).length > 0) {
    setFieldErrors(newErrors);
    return;
  }

  try {
    const { data } = await sendToServer('admin/api/auth/login', credentials, 'POST');
    toast.success('Ви увійшли успішно!');
    setUserName(data.username);
  } catch (error) {
    handleError(error, setFieldErrors);
  }
}

export async function register(credentials, setFieldErrors) {
  const newErrors = {};

  if (!validateEmail(credentials.email)) {
    newErrors.email = 'Некоректна електронна пошта';
  }

  if (credentials.password !== credentials.confirmPassword) {
    newErrors.confirmPassword = 'Паролі не співпадають';
  }

  if (Object.keys(newErrors).length > 0) {
    setFieldErrors(newErrors);
    return;
  }

  try {
    const { confirmPassword, ...dataToSend } = credentials;
    const { data } = await sendToServer('admin/api/auth/register', dataToSend, 'POST');
    toast.success(data.message || 'Успішна реєстрація!');
    return true;
  } catch (error) {
    handleError(error, setFieldErrors);
  }
}

export async function checkAuth(setUserName) {
  try {
    const { data } = await sendToServer('admin/api/auth/session', null, 'GET');
    setUserName(data.username);
  } catch (error) {
    if (error?.status === 401) {
      setUserName('');
    } else {
      toast.error(error.message || "Не вдалося перевірити авторизацію.");
    }
  }
}

export async function logout(setUserName) {
  try {
    const { data } = await sendToServer('admin/api/auth/logout', null, 'GET');
    toast.success(data.message || 'Ви вийшли з системи.');
    setUserName('');
  } catch (error) {
    if (error?.status === 401) {
      toast.error('Ви не авторизовані!');
    } else {
      toast.error("Зв'язок з сервером втрачено.");
    }
  }
}

export async function fetchOrCreateUser() {
  try {
    const userId = await userExists();
    return userId
  } catch (error) {
    toast.error("Не вдалося отримати дані користувача.");
    throw error;
  }
}

export async function userExists() {
  try {
    const { data } = await sendToServer("api/users/me", null, "GET");
    return data.id;
  } catch (error) {
    if (error?.status === 401) {
      return await createUser();
    } else {
      throw error;
    }
  }
}

export async function createUser() {
  try {
    const { data } = await sendToServer("api/users", null, "POST");
    return data.user_id;
  } catch (error) {
    toast.error(error.message || "Помилка реєстрації нового користувача.");
  }
}
