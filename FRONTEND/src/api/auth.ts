// import axios from "axios";
import client from "./client";

// type LoginPayload = { email: string; password: string; remember?: boolean };
type LoginPayload = { email: string; password: string; remember?: boolean };

// export async function doLogin(payload: LoginPayload) {
//   // В реальном проекте - вызов axios.post('/api/login', payload)
//   // Здесь сделаем fake-ответ для демонстрации разных ошибок
//   await new Promise((r) => setTimeout(r, 700));

//   if (!payload.email.includes("@")) {
//     // имитируем ошибку валидации email
//     return { ok: false, code: "INVALID_EMAIL", message: "Email некорректен" };
//   }

//   if (payload.email === "user@example.com" && payload.password === "password") {
//     return { ok: true, data: { user: { id: "1", email: payload.email, name: "User" }, token: "fake-token" } };
//   }

//   return { ok: false, code: "AUTH_FAIL", message: "Неправильный логин или пароль" };
// }

export async function doLogin(payload: LoginPayload) {
  try {
    const res = await client.post("/auth/login", {
      login: payload.email,
      password: payload.password,
    });

    // Ожидаем { accessToken: "..." } согласно swagger
    return { ok: true, data: res.data };
  } catch (err: any) {
    // Ошибки обрабатываем и нормализуем
    if (err.response) {
      // Сервер вернул 4xx/5xx
      return {
        ok: false,
        code: err.response.data?.code ?? "AUTH_FAIL",
        message: err.response.data?.message ?? err.response.statusText,
        status: err.response.status,
      };
    }
    // Network / timeout / CORS
    return { ok: false, code: "NETWORK_ERROR", message: "Сервер недоступен" };
  }
}

// // Проверка кода и регистрация пользователя
// export async function doRegister(values: {
//   email: string;
//   password: string;
//   code: string;
// }) {
//   // Имитация API запроса
//   await new Promise((r) => setTimeout(r, 700));

//   if (!values.email || !values.email.includes("@")) {
//     return { ok: false, code: "INVALID_EMAIL", message: "Email некорректен" };
//   }

//   if (values.password.length < 6) {
//     return { ok: false, code: "WEAK_PASSWORD", message: "Пароль должен содержать минимум 6 символов" };
//   }

//   if (values.code !== "123456") { // фиксированный код для демонстрации
//     return { ok: false, code: "INVALID_CODE", message: "Неверный код подтверждения" };
//   }

//   // Имитация успешной регистрации
//   console.log(`Пользователь зарегистрирован: ${values.email}`);
//   return { 
//     ok: true, 
//     data: { 
//       user: { 
//         id: "new-user-id", 
//         email: values.email, 
//         name: "New User" 
//       }, 
//       token: "new-fake-token" 
//     } 
//   };
// }

export async function doRegister(payload: any) {
  try {
    const res = await client.post("/auth/sign_in", payload);
    return { ok: true, data: res.data };
  } catch (err: any) {
    if (err.response) {
      return { ok: false, code: err.response.data?.code, message: err.response.data?.message };
    }
    return { ok: false, code: "NETWORK_ERROR", message: "Сервер недоступен" };
  }
}


export async function checkEmail(email: string) {
  try {
    const res = await client.post("/check/email", email); // если API ожидает raw string
    return { ok: true, data: res.data };
  } catch (err: any) {
    return { ok: false, message: "Ошибка проверки email" };
  }
}

export async function checkToken() {
  try {
    const res = await client.get("/check/token");
    return { ok: true, data: res.data };
  } catch (err: any) {
    return { ok: false, message: "Ошибка проверки токена" };
  }
}