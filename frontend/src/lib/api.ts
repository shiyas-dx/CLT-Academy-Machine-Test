import { getSession } from 'next-auth/react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
  const session = await getSession();
  const token   = (session as any)?.accessToken;

  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE}${url}`, {
    cache: 'no-store',
    ...options,
    headers,
    credentials: 'include', // always send httpOnly cookies
  });

  if (response.status === 401) {
    // Attempt silent token refresh
    const refresh = await fetch(`${BASE}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refresh.ok) {
      // Retry original request
      const retryResp = await fetch(`${BASE}${url}`, {
        cache: 'no-store',
        ...options,
        headers,
        credentials: 'include',
      });
      if (!retryResp.ok) throw new Error(`API Error ${retryResp.status}`);
      return retryResp.json();
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `API Error ${response.status}`);
  }

  return response.json();
};
