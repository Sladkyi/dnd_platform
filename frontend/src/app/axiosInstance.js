import axios from 'axios';

const baseURL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL,
  // ✅ Убираем заголовок полностью
});

// Добавляем access token к каждому запросу
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обновляем access токен при 401 и повторяем запрос
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) throw new Error('Refresh token missing');

        const { data } = await axios.post(`${baseURL}/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access', data.access);
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;

        return axiosInstance(originalRequest); // Повтор запроса
      } catch (refreshError) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
