// api/recipients.ts
import client from "./client";
import type {RecipientData, CreateRecipientResponse, Recipient} from "../types/cargo";


// Функция для валидации российского телефона
const validateRussianPhone = (phone: string): boolean => {
  // Убираем все нецифровые символы
  const cleanedPhone = phone.replace(/\D/g, '');
  
  // Возможные форматы форматы:
  // +7xxxxxxxxxx (11 цифр, начинается с 7)
  // 8xxxxxxxxxx (11 цифр, начинается с 8)
  // 7xxxxxxxxxx (11 цифр, начинается с 7 без +)
  // xxxxxxxxxx (10 цифр - без кода страны)
  
  if (cleanedPhone.length === 11) {
    // 11 цифр: должен начинаться с 7 или 8
    return /^[78]\d{10}$/.test(cleanedPhone);
  } else if (cleanedPhone.length === 10) {
    // 10 цифр: без кода страны
    return /^\d{10}$/.test(cleanedPhone);
  }
  
  return false;
};

// Функция для нормализации телефона (приведение к единому формату)
const normalizeRussianPhone = (phone: string): string => {
  // Убираем все нецифровые символы
  const cleanedPhone = phone.replace(/\D/g, '');
  
  if (cleanedPhone.length === 11) {
    if (cleanedPhone.startsWith('8')) {
      // Заменяем 8 на 7 для международного формата
      return '7' + cleanedPhone.slice(1);
    }
    return cleanedPhone;
  } else if (cleanedPhone.length === 10) {
    // Добавляем код страны 7 для 10-значных номеров
    return '7' + cleanedPhone;
  }
  
  // Если формат непонятный, возвращаем как есть (бэкенд должен обработать)
  return cleanedPhone;
};

export const recipientsApi = {
  // Создание получателя
  createRecipient: async (recipientData: RecipientData): Promise<CreateRecipientResponse> => {
    try {
      console.log('Creating recipient:', recipientData);
      
      // Валидация данных
      const requiredFields = ['firstname', 'secondname', 'phone', 'email'];
      requiredFields.forEach(field => {
        if (!recipientData[field as keyof RecipientData]?.trim()) {
          throw new Error(`Отсутствует обязательное поле "${field}"`);
        }
      });

      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientData.email)) {
        throw new Error('Некорректный формат email');
      }

      // Валидация российского телефона
      if (!validateRussianPhone(recipientData.phone)) {
        throw new Error(
          'Некорректный формат российского телефона. Примеры:\n' +
          '• +7 999 123-45-67\n' +
          '• 8 (999) 123-45-67\n' +
          '• 79991234567\n' +
          '• 9991234567'
        );
      }

      // Нормализуем телефон перед отправкой
      const formattedData = {
        ...recipientData,
        phone: normalizeRussianPhone(recipientData.phone),
        email: recipientData.email.trim().toLowerCase(),
        firstname: recipientData.firstname.trim(),
        secondname: recipientData.secondname.trim(),
        thirdname: (recipientData.thirdname || '').trim()
      };

      console.log('Отправка запроса на создание получателя:', formattedData);
      
      // Отправляем запрос
      const response = await client.post<CreateRecipientResponse>("/recipients", formattedData);
      
      console.log('Получатель успешно создан. ID:', response.data.id);
      return response.data;

    } catch (error: any) {
      console.error('ERROR Ошибка создания получателя:', error);
      
      if (error.response) {
        console.error('Статус ошибки:', error.response.status);
        console.error('Данные ошибки:', error.response.data);
        
        // Обработка ошибок
        if (error.response.status === 400) {
          throw new Error(`ERROR Ошибка валидации: ${JSON.stringify(error.response.data)}`);
        }
        
        if (error.response.status === 409) {
          throw new Error('Получатель с таким email или телефоном уже существует');
        }
        
        const apiError = new Error(
          `Ошибка создания получателя: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
        (apiError as any).status = error.response.status;
        throw apiError;
      }
      
      // Если это наша ошибка валидации
      if (error.message.includes('Некорректный формат') || 
          error.message.includes('Отсутствует обязательное поле')) {
        throw error;
      }
      
      throw new Error(`ERROR Ошибка соединения: ${error.message}`);
    }
  },

//   // мб понадобиться позже...
//   createRussianRecipient: async (data: {
//     firstname: string;
//     secondname: string;
//     phone: string;
//     email: string;
//     thirdname?: string;
//   }): Promise<number> => {
//     // Дополнительная валидация имен
//     const nameRegex = /^[а-яА-ЯёЁa-zA-Z\-]+$/;
    
//     if (!nameRegex.test(data.firstname)) {
//       throw new Error('Имя может содержать только буквы и дефис');
//     }
    
//     if (!nameRegex.test(data.secondname)) {
//       throw new Error('Фамилия может содержать только буквы и дефис');
//     }
    
//     if (data.thirdname && !nameRegex.test(data.thirdname)) {
//       throw new Error('Отчество может содержать только буквы и дефис');
//     }

//     const recipientData: RecipientData = {
//       firstname: data.firstname.trim(),
//       secondname: data.secondname.trim(),
//       thirdname: (data.thirdname || '').trim(),
//       phone: data.phone.trim(),
//       email: data.email.trim().toLowerCase()
//     };

//     const response = await recipientsApi.createRecipient(recipientData);
//     return response.id;
//   },


//   validatePhone: (phone: string): { isValid: boolean; message?: string; normalized?: string } => {
//     const isValid = validateRussianPhone(phone);
    
//     if (!isValid) {
//       return {
//         isValid: false,
//         message: 'Некорректный формат российского телефона'
//       };
//     }
    
//     return {
//       isValid: true,
//       normalized: normalizeRussianPhone(phone),
//       message: 'Телефон в правильном формате'
//     };
//   },
  

  // Получение получателя по ID
  getRecipient: async (id: number): Promise<Recipient> => {
    try {
      const response = await client.get<Recipient>(`/recipients/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('ERROR Ошибка получения получателя:', error);
      throw error;
    }
  },

  // Поиск получателей
  searchRecipients: async (params?: {
    email?: string;
    phone?: string;
    name?: string;
  }): Promise<Recipient[]> => {
    try {
      const response = await client.get<Recipient[]>("/recipients", { params });
      return response.data;
    } catch (error: any) {
      console.error('ERROR  Ошибка поиска получателей:', error);
      throw error;
    }
  },

  // Обновление получателя
  updateRecipient: async (id: number, data: Partial<RecipientData>): Promise<Recipient> => {
    try {
      const response = await client.put<Recipient>(`/recipients/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('ERROR  Ошибка обновления получателя:', error);
      throw error;
    }
  },

//   // Вспомогательная функция для быстрого создания получателя
//   createMinimalRecipient: async (data: {
//     firstname: string;
//     secondname: string;
//     phone: string;
//     email: string;
//     thirdname?: string;
//   }): Promise<number> => {
//     const recipientData: RecipientData = {
//       firstname: data.firstname.trim(),
//       secondname: data.secondname.trim(),
//       thirdname: data.thirdname?.trim() || '',
//       phone: data.phone.trim(),
//       email: data.email.trim().toLowerCase()
//     };

//     const response = await recipientsApi.createRecipient(recipientData);
//     return response.id;
//   },
};