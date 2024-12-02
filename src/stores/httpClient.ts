import axios, { type AxiosInstance, type AxiosResponse, AxiosError } from 'axios';

const API_URL = 'http://localhost:3000';

// Создаём экземпляр Axios с конфигурацией
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// Настройка интерсепторов для обработки ответов
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('Ошибка HTTP-запроса:', error.message);
    return Promise.reject(error);
  }
);
