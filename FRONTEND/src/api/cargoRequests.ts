// api/cargoRequests.ts
import client from "./client";
import { 
  type CargoRequestResponse, 
  type CargoRequestFilter,
  type CargoRequest,
} from "../types/cargo";


// Заглушки для разработки
const mockCargoRequests: CargoRequest[] = [
  {
    id: "req-1",
    consignerId: 1,
    recipientId: 2,
    createdAt: Math.floor(Date.now() / 1000) - 86400, // вчера
    deadline: Math.floor(Date.now() / 1000) + 86400 * 7, // через неделю
    calculatedTripId: null,
    actualTripId: null,
    fromStation: {
      address: "Москва, ул. Тверская, д. 1",
      coords: { lat: 55.7558, lon: 37.6173 }
    },
    toStation: {
      address: "Санкт-Петербург, Невский проспект, д. 1",
      coords: { lat: 59.9343, lon: 30.3351 }
    },
    maxPrice: "5000.00",
    status: "создана"
  },
  {
    id: "req-2",
    consignerId: 1,
    recipientId: 3,
    createdAt: Math.floor(Date.now() / 1000) - 172800, // 2 дня назад
    deadline: Math.floor(Date.now() / 1000) + 86400 * 3, // через 3 дня
    calculatedTripId: "trip-1",
    actualTripId: "trip-1",
    fromStation: {
      address: "Москва, Ленинградский проспект, д. 15",
      coords: { lat: 55.7961, lon: 37.5350 }
    },
    toStation: {
      address: "Казань, ул. Баумана, д. 1",
      coords: { lat: 55.7905, lon: 49.1213 }
    },
    maxPrice: "3000.00",
    status: "одобрена водителем"
  },
  {
    id: "req-3",
    consignerId: 1,
    recipientId: 4,
    createdAt: Math.floor(Date.now() / 1000) - 432000, // 5 дней назад
    deadline: Math.floor(Date.now() / 1000) + 86400, // завтра
    calculatedTripId: null,
    actualTripId: null,
    fromStation: {
      address: "Москва, ул. Арбат, д. 25",
      coords: { lat: 55.7496, lon: 37.5915 }
    },
    toStation: {
      address: "Нижний Новгород, ул. Большая Покровская, д. 1",
      coords: { lat: 56.3269, lon: 44.0056 }
    },
    maxPrice: "7500.00",
    status: "доставка началась"
  }
];

const USE_MOCK_DATA = true; // Переключить на false когда бек будет готов

export const cargoRequestsApi = {
  // Универсальный метод для получения заявок с пагинацией и фильтрацией
  getCargoRequests: async (
    filter: CargoRequestFilter = {},
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<CargoRequestResponse> => {
    // Заглушка для разработки
    if (USE_MOCK_DATA) {
      console.log('📦 Using mock cargo requests data');
      console.log('Filter:', filter);
      console.log('Page:', pageNumber, 'Size:', pageSize);
      
      // Фильтрация заглушек
      let filteredRequests = mockCargoRequests;
      
      if (filter.consignerId) {
        filteredRequests = filteredRequests.filter(req => req.consignerId === filter.consignerId);
      }
      
      if (filter.status) {
        const statuses = filter.status.split(',');
        filteredRequests = filteredRequests.filter(req => statuses.includes(req.status));
      }
      
      // Пагинация
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
      
      return {
        cargoRequests: paginatedRequests
      };
    }

    // Реальный запрос когда бек готов
    const response = await client.post<CargoRequestResponse>(
      `/cargo_request?page_number=${pageNumber}&page_size=${pageSize}`,
      filter
    );
    return response.data;
  },

  // Получение активных заявок (без пагинации для главной страницы)
  getActiveCargoRequests: async (
    consignerId: number
  ): Promise<CargoRequestResponse> => {
    const activeStatuses = [
      "создана",
      "ждет выбора поездки", 
      "ждет одобрения водителя",
      "одобрена водителем",
      "доставка началась",
      "проблема доставки"
    ];
    
    const filter: CargoRequestFilter = {
      consignerId: consignerId,
      status: activeStatuses.join(",")
    };
    
    // Для главной страницы берем первые 50 заявок
    return await cargoRequestsApi.getCargoRequests(filter, 1, 50);
  },

  getCargoTypes: async () => {
    console.log('📋 Getting cargo types');
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      cargoTypes: [
        { id: 1, type: "Обычный", fragile: false },
        { id: 2, type: "Хрупкий", fragile: true },
        { id: 3, type: "Осторожно стекло", fragile: true },
      ]
    };
  },

  createCargoRequest: async (requestData: any) => {
    console.log('📦 Creating cargo request:', requestData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: Math.floor(Math.random() * 1000) + 1 };
  },

  createRecipient: async (recipientData: any) => {
    console.log('👤 Creating recipient:', recipientData);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: Math.floor(Math.random() * 1000) + 1 };
  },

  createCargo: async (cargoItems: any[]) => {
    console.log('📦 Creating cargo items:', cargoItems);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ids: cargoItems.map((_, index) => index + 1) };
  },
};

