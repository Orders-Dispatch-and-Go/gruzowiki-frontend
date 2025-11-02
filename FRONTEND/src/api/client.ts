// src/api/client.ts
import axios from "axios";

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://192.168.0.100:4000"; // <- замени на свой ip:port
const client = axios.create({
  // baseURL: API_HOST,
  baseURL: '',
  // если сервер будет ставить HttpOnly cookie
  // он будет их ставить???
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// Добавляем интерсепторы для отладки
client.interceptors.request.use(request => {
  console.log('Отправляем запрос:', request.method?.toUpperCase(), request.url);
  console.log('Данные:', request.data);
  // console.log('Полный URL:',  request.url);
  return request;
});

client.interceptors.response.use(
  response => {
    console.log('✅ Получен ответ:', response.status, response.data);
    return response;
  },
  error => {
    console.log('Ошибка запроса:', error.response?.status, error.response?.data);
    console.log('URL ошибки:', error.config?.baseURL + error.config?.url);
    return Promise.reject(error);
  }
);

export default client;
