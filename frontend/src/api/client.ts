/**
 * StockSense API Client
 * Centralized HTTP client managing authentication tokens and error handling.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('stocksense_token');
}

export function setToken(token: string): void {
  localStorage.setItem('stocksense_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('stocksense_token');
  localStorage.removeItem('stocksense_user');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = 'Request failed';
      if (typeof data === 'object' && data !== null) {
        errorMessage = data.detail || data.message || JSON.stringify(data);
      } else if (typeof data === 'string' && data) {
        errorMessage = data;
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Cannot reach StockSense API server. Please ensure the backend is running.',
      0
    );
  }
}

export { ApiError, BASE_URL };
