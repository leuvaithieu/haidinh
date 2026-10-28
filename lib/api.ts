const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
    endpoint: string,
    options?: RequestInit,
) {
    if (!API_URL) {
        throw new Error('Chưa cấu hình NEXT_PUBLIC_API_URL');
    }

    const token = localStorage.getItem('access_token');
    const headers = new Headers(options?.headers);

    // FormData phải để trình duyệt tự thiết lập Content-Type
    // và boundary, không ép thành application/json.
    const isFormData =
        typeof FormData !== 'undefined' &&
        options?.body instanceof FormData;

    if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
}
