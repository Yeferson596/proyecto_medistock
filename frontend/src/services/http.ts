const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? 'Error de API');
  }
  return response.json() as Promise<T>;
};

export const http = {
  get: async <T>(path: string) => handleResponse<T>(await fetch(`${API_BASE_URL}${path}`)),
  post: async <T>(path: string, body: unknown) =>
    handleResponse<T>(
      await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    ),
  put: async <T>(path: string, body: unknown) =>
    handleResponse<T>(
      await fetch(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    ),
  delete: async <T>(path: string) =>
    handleResponse<T>(
      await fetch(`${API_BASE_URL}${path}`, {
        method: 'DELETE'
      })
    )
};
