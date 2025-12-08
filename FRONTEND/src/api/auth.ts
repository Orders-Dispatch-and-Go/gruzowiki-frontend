// import axios from "axios";
import client from "./client";

type LoginPayload = { email: string; password: string; remember?: boolean };

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  secondName: string;
  thirdName?: string;
  phone?: string;
  role: "ROLE_CONSIGNER" | "ROLE_CARRIER";
  birthdate: string;
};


export async function doLogin(payload: LoginPayload) {
  try {
    const res = await client.post("/auth/sign_in", {
      login: payload.email,
      password: payload.password,
    });

    console.log("Ответ от sign_in:", res.data);

    if (res.data.accessToken) {
      // Сохраняем токен в localStorage
      localStorage.setItem("token", res.data.accessToken);
      
      // Декодируем токен чтобы получить роль
      try {
        const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
        console.log("Декодированный токен:", payload);
        
        // Ищем роль
        let role = 'ROLE_CONSIGNER';
        if (payload.userAuthorities && payload.userAuthorities.length > 0) {
          role = payload.userAuthorities[0];
        }
        
        console.log("Роль из токена:", role);
        
        return { 
          ok: true, 
          data: {
            token: res.data.accessToken,
            user: {
              id: payload.sub || "unknown",
              email: payload.email || payload.userData?.email || payload.login,
              role: role
            }
          }
        };
      } catch (decodeErr) {
        console.error("Ошибка декодирования токена:", decodeErr);
        
        // Если не удалось декодировать, используем по умолчанию
        return { 
          ok: true, 
          data: {
            token: res.data.accessToken,
            user: {
              id: "unknown",
              email: payload.email,
              role: 'ROLE_CONSIGNER'
            }
          }
        };
      }
    }

    return { ok: true, data: res.data };
    
  } catch (err: any) {
    console.error("Ошибка sign_in:", err.response?.data);
    
    if (err.response) {
      return {
        ok: false,
        code: err.response.data?.code ?? "AUTH_FAIL",
        message: err.response.data?.message ?? err.response.statusText,
        status: err.response.status,
      };
    }
    
    return { ok: false, code: "NETWORK_ERROR", message: "Сервер недоступен" };
  }
}

export async function doRegister(payload: RegisterPayload) {
  try {
    console.log("Отправляем данные регистрации:", payload);
    const res = await client.post("/auth/sign_up", payload);
    
    console.log("Полный ответ от sign_up:", res);
    console.log("Ответ от sign_up:", res.data);

    return { 
      ok: true, 
      data: {
        id: res.data.id,
        accessToken: res.data.accessToken
      } 
    };
  } catch (err: any) {
    console.error("Ошибка sign_up:", err.response?.data);
    if (err.response) {
      return { 
        ok: false, 
        code: err.response.data?.code, 
        message: err.response.data?.message || "Ошибка регистрации" 
      };
    }
    return { ok: false, code: "NETWORK_ERROR", message: "Сервер недоступен" };
  }
}

export async function checkEmail(email: string) {
  // try {
  //   const res = await client.post("/check/email", email); // если API ожидает raw string
  //   return { ok: true, data: res.data };
  // } catch (err: any) {
  //   return { ok: false, message: "Ошибка проверки email" };
  // }

  // заглушка
  try {
    console.log("Проверка email:", email);
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Всегда возвращаем успех для тестирования
    return { 
      ok: true, 
      data: { 
        message: "Код отправлен на email",
        code: "123456789012" // пример кода для демонстрации
      } 
    };
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