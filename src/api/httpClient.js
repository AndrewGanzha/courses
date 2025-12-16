const TOKEN_STORAGE_KEY = 'auth_token';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(
  /\/$/,
  ''
);

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const clearAuthToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

const parseJsonSafely = (text) => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

export const request = async (path, { method = 'GET', body, headers = {}, auth = true } = {}) => {
  const url = buildUrl(path);
  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  let payload = body;

  if (payload instanceof FormData) {
    // FormData sets its own Content-Type with boundary; keep headers untouched
  } else if (payload !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(payload);
  }

  if (auth) {
    const token = getAuthToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: payload,
  });

  const raw = await response.text();
  const data = parseJsonSafely(raw);

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with status ${response.status}: ${response.statusText}`
    );
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
};

export const apiGet = (path, options = {}) => request(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options = {}) =>
  request(path, { ...options, method: 'POST', body });
export const apiPut = (path, body, options = {}) =>
  request(path, { ...options, method: 'PUT', body });
export const apiPatch = (path, body, options = {}) =>
  request(path, { ...options, method: 'PATCH', body });
export const apiDelete = (path, options = {}) => request(path, { ...options, method: 'DELETE' });

export const apiConfig = {
  baseUrl: API_BASE_URL,
  tokenStorageKey: TOKEN_STORAGE_KEY,
};
