import { API_BASE_URL } from '../config';

export const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers);

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
    }

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    return fetch(fullUrl, { ...options, headers });
};
