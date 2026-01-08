// JWT Authentication utilities for admin pages

export function getToken() {
  return localStorage.getItem('adminToken');
}

export function checkAuth() {
  if (!getToken()) {
    window.location.href = '/admin/login.html';
    return false;
  }
  return true;
}

export async function authFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = '/admin/login.html';
    return null;
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
    return null;
  }

  return response;
}

export function logout() {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login.html';
}
