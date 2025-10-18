// import axios from "axios";

type LoginPayload = { email: string; password: string; remember?: boolean };

export async function doLogin(payload: LoginPayload) {
  // В реальном проекте - вызов axios.post('/api/login', payload)
  // Здесь сделаем fake-ответ для демонстрации разных ошибок
  await new Promise((r) => setTimeout(r, 700));

  if (!payload.email.includes("@")) {
    // имитируем ошибку валидации email
    return { ok: false, code: "INVALID_EMAIL", message: "Email некорректен" };
  }

  if (payload.email === "user@example.com" && payload.password === "password") {
    return { ok: true, data: { user: { id: "1", email: payload.email, name: "User" }, token: "fake-token" } };
  }

  return { ok: false, code: "AUTH_FAIL", message: "Неправильный логин или пароль" };
}
