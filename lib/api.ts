const API_URL = process.env.NEXT_PUBLIC_API_URL;

console.log('API_URL:', API_URL);

export async function apiFetch(
  endpoint: string,
  options?: RequestInit,
) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options?.headers,
    },
  });

  return response;
}