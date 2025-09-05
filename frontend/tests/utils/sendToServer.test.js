import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendToServer } from '../../src/utils/api';

// Mock config.json
vi.mock('../../config.json', () => ({
  baseApiUrl: 'https://api.example.com'
}))

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('sendToServer', () => {
  it('sends a POST request with JSON body', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      headers: {
        get: () => 'application/json'
      }
    }

    mockFetch.mockResolvedValue(mockResponse)

    const result = await sendToServer('/test-endpoint', { key: 'value' })

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ key: 'value' })
      })
    )

    expect(result).toEqual({
      status: 200,
      data: { success: true }
    })
  })

  it('sends a GET request with query params', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ items: [1, 2, 3] }),
      headers: {
        get: () => 'application/json'
      }
    }

    mockFetch.mockResolvedValue(mockResponse)

    const data = { page: 1, limit: 10 }
    const result = await sendToServer('/get-items', data, 'GET')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/get-items?page=1&limit=10',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: {}
      })
    )

    expect(result).toEqual({
      status: 200,
      data: { items: [1, 2, 3] }
    })
  })

  it('throws an error on failed response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
      headers: {
        get: () => 'application/json'
      }
    }

    mockFetch.mockResolvedValue(mockResponse)

    await expect(sendToServer('/missing', null, 'GET')).rejects.toMatchObject({
      message: 'Not found',
      status: 404,
      responseData: { message: 'Not found' }
    })
  })

  it('handles non-JSON response', async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      json: async () => null, // Won’t be called
      headers: {
        get: () => 'text/plain'
      }
    }

    mockFetch.mockResolvedValue(mockResponse)

    const result = await sendToServer('/no-content', null, 'GET')

    expect(result).toEqual({
      status: 204,
      data: null
    })
  })
})
