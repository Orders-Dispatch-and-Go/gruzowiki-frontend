// src/api/client.ts
import axios from "axios";

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://51.250.34.151:8074/";
const client = axios.create({
    // baseURL: API_HOST,
    baseURL: "",
    // если сервер будет ставить HttpOnly cookie
    // он будет их ставить???
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Добавляем интерсепторы для отладки
client.interceptors.request.use((request) => {
    const token = localStorage.getItem("token");

    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
        console.log(
            "🔐 Добавляем токен в заголовок:",
            token.substring(0, 20) + "..."
        );
    }
    console.log(
        "Отправляем запрос:",
        request.method?.toUpperCase(),
        request.url
    );
    console.log("Данные:", request.data);
    console.log("Полный URL:", request.url);
    return request;
});

client.interceptors.response.use(
    (response) => {
        console.log("✅ Получен ответ:", response.status, response.data);
        return response;
    },
    (error) => {
        console.log(
            "Ошибка запроса:",
            error.response?.status,
            error.response?.data
        );
        console.log("URL ошибки:", error.config?.baseURL + error.config?.url);
        console.log("Метод:", error.config?.method);

        // Если 401 - токен невалидный
        if (error.response?.status === 401) {
            console.log("⚠️ Токен невалидный, нужен выход");
            localStorage.removeItem("token");
            // Можно добавить редирект на логин
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default client;
