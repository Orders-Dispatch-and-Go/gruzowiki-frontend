import axios from "axios";

// const API_HOST = import.meta.env.VITE_API_HOST ?? "http://51.250.34.151:8074/";

const client = axios.create({
    baseURL: "/", // for vite-proxy
    withCredentials: false, // отключаем cookies
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

client.interceptors.request.use((request) => {
    console.log("📤 Отправляем запрос:", {
        url: request.url,
        method: request.method,
        baseURL: request.baseURL,
        data: request.data, // Добавили это!
        // fullUrl: request.baseURL + request.url,
        headers: request.headers
    });
    const token = localStorage.getItem("token");

    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
        console.log("Добавляем токен:", token.substring(0, 20) + "...");
    }

    return request;
});

client.interceptors.response.use(
    (response) => {
        console.log("Успешный ответ:", {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error("Ошибка запроса:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.config?.headers
        });
        const status = error.response?.status;
        const url = error.config?.url ?? "";

        // 401 только если НЕ login запрос
        if (status === 401 && !url.includes("/auth/sign_in")) {
            console.log("401 → токен недействителен");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default client;
