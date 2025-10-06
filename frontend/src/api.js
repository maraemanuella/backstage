import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Intercepta cada requisição e adiciona o token de acesso
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepta respostas com erro 401 (token expirado)
api.interceptors.response.use(
  (response) => response, // Se for sucesso, segue normal
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e ainda não tentamos atualizar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      if (!refreshToken) {
        // Se não tiver refresh token, redireciona para login
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Tenta pegar novo access token
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem(ACCESS_TOKEN, newAccessToken);

        // Atualiza o header da requisição original e repete
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou (token inválido/expirado)
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
