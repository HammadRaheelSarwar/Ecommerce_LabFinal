const LOCAL_API_ORIGIN = 'http://localhost:5000';

const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? LOCAL_API_ORIGIN : '')
);

const requireApiBaseUrl = () => {
  if (API_BASE_URL) return API_BASE_URL;
  if (import.meta.env.DEV) return LOCAL_API_ORIGIN;
  throw new Error('Missing VITE_API_BASE_URL. Set it to your Railway backend URL.');
};

export const SOCKET_URL = normalizeBaseUrl(
  import.meta.env.VITE_SOCKET_URL || requireApiBaseUrl()
);

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const resolvedBase = requireApiBaseUrl();
  return `${resolvedBase}${normalizedPath}`;
};

export const resolveApiUrl = (url) => {
  if (!url) return url;

  if (url.startsWith('http://localhost:5000')) {
    return `${requireApiBaseUrl()}${url.slice('http://localhost:5000'.length)}`;
  }

  if (url.startsWith('/')) {
    return apiUrl(url);
  }

  return url;
};
