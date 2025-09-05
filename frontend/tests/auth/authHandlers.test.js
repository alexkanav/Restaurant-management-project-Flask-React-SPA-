import { toast } from 'react-toastify'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendToServer } from "../../src/utils/api";
import * as auth from '../../src/utils/authUtils'


vi.mock('../../src/utils/api', () => ({
  sendToServer: vi.fn()
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Setup test helpers
const mockSetUserName = vi.fn()
const mockSetFieldErrors = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('login', () => {
  it('should show validation error for invalid email', async () => {
    await auth.login({ email: 'bademail', password: '1234' }, mockSetUserName, mockSetFieldErrors)

    expect(mockSetFieldErrors).toHaveBeenCalledWith({
      email: 'Некоректна електронна пошта'
    })
    expect(sendToServer).not.toHaveBeenCalled()
  })

  it('should login successfully and show toast', async () => {
   sendToServer.mockResolvedValue({
      data: { username: 'admin' }
    })

    await auth.login({ email: 'admin@example.com', password: '1234' }, mockSetUserName, mockSetFieldErrors)

    expect(sendToServer).toHaveBeenCalledWith(
      'admin/api/auth/login',
      { email: 'admin@example.com', password: '1234' },
      'POST'
    )
    expect(mockSetUserName).toHaveBeenCalledWith('admin')
    expect(toast.success).toHaveBeenCalledWith('Ви увійшли успішно!')
  })

  it('should handle login error', async () => {
    sendToServer.mockRejectedValue({
      status: 401,
      message: 'Wrong credentials'
    })

    await auth.login({ email: 'admin@example.com', password: 'wrong' }, mockSetUserName, mockSetFieldErrors)

    expect(toast.error).toHaveBeenCalledWith('Wrong credentials')
    expect(mockSetFieldErrors).toHaveBeenCalledWith({})
  })
})

describe('register', () => {
  it('should validate email and password mismatch', async () => {
    await auth.register({
      email: 'invalid',
      password: '123',
      confirmPassword: '456'
    }, mockSetFieldErrors)

    expect(mockSetFieldErrors).toHaveBeenCalledWith({
      email: 'Некоректна електронна пошта',
      confirmPassword: 'Паролі не співпадають'
    })
  })

  it('should register successfully', async () => {
    sendToServer.mockResolvedValue({
      data: { message: 'Добро пожаловать!' }
    })

    const result = await auth.register({
      email: 'user@example.com',
      password: '123456',
      confirmPassword: '123456'
    }, mockSetFieldErrors)

    expect(sendToServer).toHaveBeenCalledWith(
      'admin/api/auth/register',
      { email: 'user@example.com', password: '123456' },
      'POST'
    )
    expect(toast.success).toHaveBeenCalledWith('Добро пожаловать!')
    expect(result).toBe(true)
  })

  it('should handle register error', async () => {
    sendToServer.mockRejectedValue({
      message: 'Email already exists'
    })

    await auth.register({
      email: 'test@example.com',
      password: '123456',
      confirmPassword: '123456'
    }, mockSetFieldErrors)

    expect(toast.error).toHaveBeenCalledWith('Email already exists')
    expect(mockSetFieldErrors).toHaveBeenCalledWith({})
  })
})

describe('checkAuth', () => {
  it('should set username on success', async () => {
    sendToServer.mockResolvedValue({
      data: { username: 'john' }
    })

    await auth.checkAuth(mockSetUserName)
    expect(mockSetUserName).toHaveBeenCalledWith('john')
  })

  it('should clear username on 401', async () => {
    sendToServer.mockRejectedValue({ status: 401 })

    await auth.checkAuth(mockSetUserName)
    expect(mockSetUserName).toHaveBeenCalledWith('')
  })

  it('should show error toast on other errors', async () => {
    sendToServer.mockRejectedValue({ message: 'Server crashed' })

    await auth.checkAuth(mockSetUserName)
    expect(toast.error).toHaveBeenCalledWith('Server crashed')
  })
})

describe('logout', () => {
  it('should call logout and reset user', async () => {
    sendToServer.mockResolvedValue({
      data: { message: 'Logged out' }
    })

    await auth.logout(mockSetUserName)

    expect(toast.success).toHaveBeenCalledWith('Logged out')
    expect(mockSetUserName).toHaveBeenCalledWith('')
  })

  it('should handle 401 error', async () => {
    sendToServer.mockRejectedValue({ status: 401 })

    await auth.logout(mockSetUserName)
    expect(toast.error).toHaveBeenCalledWith('Ви не авторизовані!')
  })

  it('should handle other logout errors', async () => {
    sendToServer.mockRejectedValue({ message: 'Server error' })

    await auth.logout(mockSetUserName)
    expect(toast.error).toHaveBeenCalledWith("Зв'язок з сервером втрачено.")
  })
})

describe('userExists', () => {
  it('should return user ID if exists', async () => {
    sendToServer.mockResolvedValue({
      data: { id: 'user123' }
    })

    const id = await auth.userExists()
    expect(id).toBe('user123')
  })

  it('should throw on other errors', async () => {
    sendToServer.mockRejectedValue({ status: 500 })

    await expect(auth.userExists()).rejects.toEqual({ status: 500 })
  })
})

describe("createUser", () => {
  it("should return user_id on success", async () => {
    sendToServer.mockResolvedValue({
      data: { user_id: "12345" },
    });

    const result = await auth.createUser();

    expect(sendToServer).toHaveBeenCalledWith("api/users", null, "POST");
    expect(result).toBe("12345");
  });

  it("should call toast.error with error message on failure", async () => {
    const errorMessage = "Server error";
    sendToServer.mockRejectedValue(new Error(errorMessage));

    const result = await auth.createUser();

    expect(result).toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it("should show default error message if error has no message", async () => {
    sendToServer.mockRejectedValue({});

    await auth.createUser();

    expect(toast.error).toHaveBeenCalledWith("Помилка реєстрації нового користувача.");
  });
});

