const LOCAL_API_ORIGIN = 'http://localhost:5000';

const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? LOCAL_API_ORIGIN : '')
);

export const SOCKET_URL = normalizeBaseUrl(
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL || (import.meta.env.DEV ? LOCAL_API_ORIGIN : '')
);

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const resolvedBase = API_BASE_URL || (import.meta.env.DEV ? LOCAL_API_ORIGIN : '');
  return resolvedBase ? `${resolvedBase}${normalizedPath}` : normalizedPath;
};

export const resolveApiUrl = (url) => {
  if (!url) return url;

  if (url.startsWith('http://localhost:5000')) {
    const resolvedBase = API_BASE_URL || (import.meta.env.DEV ? LOCAL_API_ORIGIN : '');
    return resolvedBase ? `${resolvedBase}${url.slice('http://localhost:5000'.length)}` : url;
  }

  if (url.startsWith('/')) {
    return apiUrl(url);
  }

  return url;
};
