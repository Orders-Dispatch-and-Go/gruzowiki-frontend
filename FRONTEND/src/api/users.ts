// api/users.ts
import client from "./client";

// Переключить на false когда бек будет готов
const USE_MOCK_DATA = true;

export interface User {
  id: number;
  email: string;
  rolesId: number[];
  firstName: string;
  secondName: string;
  thirdName: string;
  phone: string;
  birthdate: string;
  createdAt: string;
}


// Заглушка для пользователя
const mockUser: User = {
  id: 1,
  email: "shipper@example.com",
  rolesId: [1],
  firstName: "Иван",
  secondName: "Иванов",
  thirdName: "Иванович",
  phone: "+7 (999) 123-45-67",
  birthdate: "1990-01-01",
  createdAt: "2024-01-01T00:00:00.000Z"
};


export const usersApi = {
  // Получение данных текущего пользователя
  getCurrentUser: async (): Promise<User> => {
    // Заглушка для разработки
    if (USE_MOCK_DATA) {
      console.log('👤 Using mock user data');
      return mockUser;
    }

    // Реальный запрос когда бек готов
    const response = await client.get<User>("/users");
    return response.data;
  },

  // Получение пользователя по токену (для логина)
  getUserByToken: async (): Promise<{ user: User; token: string }> => {
    // Сначала получаем данные пользователя
    const user = await usersApi.getCurrentUser();
    
    // Токен уже в заголовках, но если нужно его вернуть
    return {
      user,
      token: "" // или можно вернуть из localStorage
    };
  },
};