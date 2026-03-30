import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log('API_BASE_URL:', API_BASE_URL); 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/* ========================= AUTH STORAGE ========================= */

// Sauvegarder auth (token + user + expiration)
export const setAuth = (token, user) => {
  const data = {
    token,
    user,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24h
  };

  localStorage.setItem('auth', JSON.stringify(data));
};

// Récupérer auth
export const getAuth = () => {
  const data = JSON.parse(localStorage.getItem('auth'));

  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    clearAuth();
    return null;
  }

  return data;
};

// Supprimer auth
export const clearAuth = () => {
  localStorage.removeItem('auth');
};

// Vérifier si connecté
export const isAuthenticated = () => {
  return !!getAuth();
};

/* ========================= INTERCEPTOR REQUEST ========================= */

api.interceptors.request.use((config) => {
  const auth = getAuth();
  console.log("TOKEN UTILISÉ:", auth?.token); // 🔥 Vérifie ici

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

/* ========================= INTERCEPTOR RESPONSE ========================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expiré
      if (error.response.status === 401) {
        clearAuth();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;