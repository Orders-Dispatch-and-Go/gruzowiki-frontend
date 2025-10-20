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

// Отправка кода подтверждения на email
export async function doVerifyEmail(email: string) {
  // Имитация API запроса
  await new Promise((r) => setTimeout(r, 700));

  if (!email || !email.includes("@")) {
    return { ok: false, code: "INVALID_EMAIL", message: "Email некорректен" };
  }

  // Имитация успешной отправки кода
  console.log(`Код подтверждения отправлен на: ${email}`);
  return { ok: true, message: "Код подтверждения отправлен на email" };
}

// Проверка кода и регистрация пользователя
export async function doRegister(values: {
  email: string;
  password: string;
  code: string;
}) {
  // Имитация API запроса
  await new Promise((r) => setTimeout(r, 700));

  if (!values.email || !values.email.includes("@")) {
    return { ok: false, code: "INVALID_EMAIL", message: "Email некорректен" };
  }

  if (values.password.length < 6) {
    return { ok: false, code: "WEAK_PASSWORD", message: "Пароль должен содержать минимум 6 символов" };
  }

  if (values.code !== "123456") { // фиксированный код для демонстрации
    return { ok: false, code: "INVALID_CODE", message: "Неверный код подтверждения" };
  }

  // Имитация успешной регистрации
  console.log(`Пользователь зарегистрирован: ${values.email}`);
  return { 
    ok: true, 
    data: { 
      user: { 
        id: "new-user-id", 
        email: values.email, 
        name: "New User" 
      }, 
      token: "new-fake-token" 
    } 
  };
}