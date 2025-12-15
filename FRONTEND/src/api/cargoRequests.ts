// api/cargoRequests.ts
import client from "./client";
import {
    type CargoRequestResponse,
    type CargoRequestFilter,
    type CargoRequest,
    type CargoTypesResponse,
    type CargoItem,
    type CreateCargoItemResponse,
    type CreateCargoItemRequest,
    type CreateCargoRequestData,
    type CreateCargoRequestResponse,
} from "../types/cargo";

// Заглушки для разработки
const mockCargoRequests: CargoRequest[] = [
    {
        id: "req-1",
        consignerId: 1,
        recipientId: 2,
        createdAt: Math.floor(Date.now() / 1000) - 86400, // вчера
        deadline: Math.floor(Date.now() / 1000) + 86400 * 7, // через неделю
        routeId: null,
        tripId: null,
        fromStation: {
            address: "Москва, ул. Тверская, д. 1",
            coords: { lat: 55.7558, lon: 37.6173 },
        },
        toStation: {
            address: "Санкт-Петербург, Невский проспект, д. 1",
            coords: { lat: 59.9343, lon: 30.3351 },
        },
        price: "5000.00",
        status: "создана",
        receiveCode: "receiveCode0",
    },
    {
        id: "req-2",
        consignerId: 1,
        recipientId: 3,
        createdAt: Math.floor(Date.now() / 1000) - 172800, // 2 дня назад
        deadline: Math.floor(Date.now() / 1000) + 86400 * 3, // через 3 дня
        routeId: "trip-1",
        tripId: "trip-1",
        fromStation: {
            address: "Москва, Ленинградский проспект, д. 15",
            coords: { lat: 55.7961, lon: 37.535 },
        },
        toStation: {
            address: "Казань, ул. Баумана, д. 1",
            coords: { lat: 55.7905, lon: 49.1213 },
        },
        price: "3000.00",
        status: "одобрена водителем",
        receiveCode: "receiveCode1",
    },
    {
        id: "req-3",
        consignerId: 1,
        recipientId: 4,
        createdAt: Math.floor(Date.now() / 1000) - 432000, // 5 дней назад
        deadline: Math.floor(Date.now() / 1000) + 86400, // завтра
        routeId: null,
        tripId: null,
        fromStation: {
            address: "Москва, ул. Арбат, д. 25",
            coords: { lat: 55.7496, lon: 37.5915 },
        },
        toStation: {
            address: "Нижний Новгород, ул. Большая Покровская, д. 1",
            coords: { lat: 56.3269, lon: 44.0056 },
        },
        price: "7500.00",
        status: "доставка началась",
        receiveCode: "receiveCode2",
    },
];

const USE_MOCK_DATA = false; // Переключить на false когда бек будет готов

export const cargoRequestsApi = {
   /**
     * Поиск заявок с фильтрами и пагинацией
     * @param filter - объект фильтра (если поле null - оно не используется)
     * @param pageNumber - номер страницы (начинается с 1)
     * @param pageSize - размер страницы
     */
    searchCargoRequests: async (
        filter: CargoRequestFilter = {},
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<CargoRequestResponse> => {
        // Заглушка для разработки если USE_MOCK_DATA = true
        if (USE_MOCK_DATA) {
            console.log("🔍 MOCK: Поиск заявок с фильтрами:", {
                filter,
                pageNumber,
                pageSize
            });

            // Имитируем поиск по mock данным
            let filteredRequests = [...mockCargoRequests];

            // Применяем фильтры (игнорируем null и undefined значения)
            if (filter.id !== undefined && filter.id !== null) {
                filteredRequests = filteredRequests.filter(req => 
                    req.id.includes(filter.id!)
                );
            }

            if (filter.consignerId !== undefined && filter.consignerId !== null) {
                filteredRequests = filteredRequests.filter(req => 
                    req.consignerId === filter.consignerId
                );
            }

            if (filter.recipientId !== undefined && filter.recipientId !== null) {
                filteredRequests = filteredRequests.filter(req => 
                    req.recipientId === filter.recipientId
                );
            }

            if (filter.status !== undefined && filter.status !== null) {
                filteredRequests = filteredRequests.filter(req => 
                    req.status === filter.status
                );
            }

            if (filter.createdFrom !== undefined && filter.createdFrom !== null) {
                const fromDate = new Date(filter.createdFrom).getTime() / 1000;
                filteredRequests = filteredRequests.filter(req => 
                    req.createdAt >= fromDate
                );
            }

            if (filter.createdTo !== undefined && filter.createdTo !== null) {
                const toDate = new Date(filter.createdTo).getTime() / 1000;
                filteredRequests = filteredRequests.filter(req => 
                    req.createdAt <= toDate
                );
            }

            // Пагинация
            const startIndex = (pageNumber - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

            return {
                cargoRequests: paginatedRequests
            };
        }

        // Реальный запрос к бекенду
        try {
            // Очищаем фильтр от null значений (но оставляем undefined)
            const cleanFilter: Record<string, any> = {};
            
            Object.entries(filter).forEach(([key, value]) => {
                if (value !== null) {
                    cleanFilter[key] = value;
                }
            });

            console.log("🔍 Отправка запроса поиска:", {
                filter: cleanFilter,
                pageNumber,
                pageSize
            });

            const response = await client.post<CargoRequestResponse>(
                `/cargo_request/search?page_number=${pageNumber}&page_size=${pageSize}`,
                cleanFilter
            );

            console.log("✅ Поиск выполнен успешно. Найдено:", 
                response.data.cargoRequests?.length || 0, "заявок");
            
            return response.data;
            
        } catch (error: any) {
            console.error("❌ Ошибка поиска заявок:", error);

            if (error.response) {
                console.error("Статус ошибки:", error.response.status);
                console.error("Данные ошибки:", error.response.data);

                // Создаем красивую ошибку
                const apiError = new Error(
                    `Ошибка поиска заявок: ${error.response.status} - ${
                        error.response.data?.message || JSON.stringify(error.response.data)
                    }`
                );
                
                (apiError as any).status = error.response.status;
                (apiError as any).data = error.response.data;
                
                throw apiError;
            }

            throw new Error(`Ошибка соединения: ${error.message}`);
        }
    },
   
   
   
    // Универсальный метод для получения заявок с пагинацией и фильтрацией
    getCargoRequests: async (
        filter: CargoRequestFilter = {},
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<CargoRequestResponse> => {
        // Заглушка для разработки
        if (USE_MOCK_DATA) {
            console.log("📦 Using mock cargo requests data");
            console.log("Filter:", filter);
            console.log("Page:", pageNumber, "Size:", pageSize);

            // Фильтрация заглушек
            let filteredRequests = mockCargoRequests;

            if (filter.consignerId) {
                filteredRequests = filteredRequests.filter(
                    (req) => req.consignerId === filter.consignerId
                );
            }

            if (filter.status) {
                const statuses = filter.status.split(",");
                filteredRequests = filteredRequests.filter((req) =>
                    statuses.includes(req.status)
                );
            }

            // Пагинация
            const startIndex = (pageNumber - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedRequests = filteredRequests.slice(
                startIndex,
                endIndex
            );

            return {
                cargoRequests: paginatedRequests,
            };
        }

        // Реальный запрос когда бек готов
        return await cargoRequestsApi.searchCargoRequests(filter, pageNumber, pageSize);
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
            "проблема доставки",
        ];

        const filter: CargoRequestFilter = {
            consignerId: consignerId,
            // status: activeStatuses.join(","),
            // status: null,
        };

        // Для главной страницы берем первые 50 заявок
        return await cargoRequestsApi.getCargoRequests(filter, 1, 50);
    },

    getCargoTypes: async ():
     Promise<CargoTypesResponse> => {
        // if (USE_MOCK_DATA) {
        //     console.log("MOCK Getting cargo types");
        //     await new Promise((resolve) => setTimeout(resolve, 300));
        //     return {
        //         cargoTypes: [
        //             { id: 0, type: "Обычный", fragile: false },
        //             { id: 1, type: "Осторожно стекло", fragile: true },
        //         ],
        //     };
        // }

        console.log("Getting cargo types");

        try {
            console.log("API Getting cargo types from API");

            const response = await client.get<CargoTypesResponse>(
                "/cargo/types"
            );

            console.log("Получены типы грузов:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("❌ Ошибка получения типов грузов:", error);

            // Для отладки - выводим больше информации
            if (error.response) {
                console.error("Статус ошибки:", error.response.status);
                console.error("Данные ошибки:", error.response.data);
                console.error("URL запроса:", error.config?.url);
            }

            // Пробрасываем ошибку дальше или возвращаем fallback
            throw error;
        }
    },

    // createCargoRequest: async (requestData: any) => {
    //     console.log("📦 Creating cargo request:", requestData);
    //     await new Promise((resolve) => setTimeout(resolve, 1000));
    //     return { id: Math.floor(Math.random() * 1000) + 1 };
    // },

    createCargoRequest: async (
        requestData: CreateCargoRequestData
    ): Promise<CreateCargoRequestResponse> => {
        try {
            console.log("📝 Creating cargo request:", requestData);

            // Валидация данных
            const requiredFields = [
                "consignerId",
                "recipientId",
                "fromStation",
                "toStation",
                "deadline",
                "maxPrice",
            ];
            requiredFields.forEach((field) => {
                if (!requestData[field as keyof CreateCargoRequestData]) {
                    throw new Error(`Отсутствует обязательное поле "${field}"`);
                }
            });

            // Валидация станций
        if (!requestData.fromStation.address?.trim()) {
            throw new Error("Адрес станции отправления не может быть пустым");
        }
        
        if (!requestData.toStation.address?.trim()) {
            throw new Error("Адрес станции назначения не может быть пустым");
        }

            // Валидация координат
            const validateCoords = (
                coords: { lat: number; lon: number },
                stationName: string
            ) => {
                if (coords.lat < -90 || coords.lat > 90) {
                    throw new Error(
                        `${stationName}: Широта должна быть между -90 и 90`
                    );
                }
                if (coords.lon < -180 || coords.lon > 180) {
                    throw new Error(
                        `${stationName}: Долгота должна быть между -180 и 180`
                    );
                }
            };

            validateCoords(
                requestData.fromStation.coords,
                "Станция отправления"
            );
            validateCoords(requestData.toStation.coords, "Станция назначения");

            // конечно вряд ли, но допустим...
            const priceRegex = /^\d+(\.\d{1,2})?$/;
            if (!priceRegex.test(requestData.maxPrice)) {
                throw new Error(
                    "Некорректный формат цены. Используйте формат: 1234.56"
                );
            }

            if (parseFloat(requestData.maxPrice) <= 0) {
                throw new Error("Цена должна быть больше 0");
            }

            // Валидация даты deadline (должна быть в будущем)
            const deadlineDate = new Date(requestData.deadline);
            const now = new Date();

            if (isNaN(deadlineDate.getTime())) {
                throw new Error(
                    "Некорректный формат даты deadline. Используйте ISO8601 формат"
                );
            }

            if (deadlineDate <= now) {
                throw new Error("Deadline должен быть в будущем");
            }

            // Форматирование данных для отправки
        const formattedData: CreateCargoRequestData = {
            consignerId: requestData.consignerId,
            recipientId: requestData.recipientId,
            fromStation: {
                address: requestData.fromStation.address.trim(),
                coords: {
                    lat: parseFloat(requestData.fromStation.coords.lat.toFixed(6)),
                    lon: parseFloat(requestData.fromStation.coords.lon.toFixed(6))
                }
            },
            toStation: {
                address: requestData.toStation.address.trim(),
                coords: {
                    lat: parseFloat(requestData.toStation.coords.lat.toFixed(6)),
                    lon: parseFloat(requestData.toStation.coords.lon.toFixed(6))
                }
            },
            deadline: new Date(requestData.deadline).toISOString(),
            maxPrice: parseFloat(requestData.maxPrice).toFixed(2)
        };

            console.log("Отправка запроса на создание заявки:", formattedData);

            // Отправляем запрос
            const response = await client.post<CreateCargoRequestResponse>(
                "/cargo_request",
                formattedData
            );

            console.log("✅ Заявка успешно создана. ID:", response.data.id);
            return response.data;
        } catch (error: any) {
            console.error("❌ Ошибка создания заявки:", error);

            if (error.response) {
                console.error("Статус ошибки:", error.response.status);
                console.error("Данные ошибки:", error.response.data);

                // Обработка специфических ошибок
                if (error.response.status === 400) {
                    throw new Error(
                        `Ошибка валидации: ${JSON.stringify(
                            error.response.data
                        )}`
                    );
                }

                if (error.response.status === 404) {
                    throw new Error("Отправитель или получатель не найден");
                }

                const apiError = new Error(
                    `Ошибка создания заявки: ${
                        error.response.status
                    } - ${JSON.stringify(error.response.data)}`
                );
                (apiError as any).status = error.response.status;
                throw apiError;
            }

            // Если это наша ошибка валидации
            if (
                error.message.includes("Отсутствует") ||
                error.message.includes("Некорректный") ||
                error.message.includes("должна быть")
            ) {
                throw error;
            }

            throw new Error(`Ошибка соединения: ${error.message}`);
        }
    },


    createCargo: async (
        cargoItems: CargoItem[]
    ): Promise<CreateCargoItemResponse> => {
        try {
            console.log("Creating cargo items:", cargoItems);

            // Валидация данных
            if (!cargoItems || cargoItems.length === 0) {
                throw new Error("Не указаны данные груза");
            }

            // Проверяем обязательные поля для каждого груза
            cargoItems.forEach((item, index) => {
                const requiredFields = [
                    "length",
                    "height",
                    "width",
                    "weight",
                    "cargoType",
                    "cargoRequestId",
                ];
                requiredFields.forEach((field) => {
                    if (
                        item[field as keyof CargoItem] === undefined ||
                        item[field as keyof CargoItem] === null
                    ) {
                        throw new Error(
                            `Груз #${
                                index + 1
                            }: отсутствует обязательное поле "${field}"`
                        );
                    }
                });

                // Проверяем числовые значения
                if (
                    item.length <= 0 ||
                    item.height <= 0 ||
                    item.width <= 0 ||
                    item.weight <= 0
                ) {
                    throw new Error(
                        `Груз #${
                            index + 1
                        }: размеры и вес должны быть положительными числами`
                    );
                }

                // Валидация uuid если нужно (базовая проверка)
                if (
                    item.cargoRequestId &&
                    typeof item.cargoRequestId !== "string"
                ) {
                    throw new Error(
                        `Груз #${
                            index + 1
                        }: cargoRequestId должен быть строкой (uuid)`
                    );
                }
            });

            // Подготавливаем данные для запроса
            const requestData: CreateCargoItemRequest = {
                cargo: cargoItems,
            };

            console.log("Отправка запроса на создание груза:", requestData);

            // Отправляем запрос
            const response = await client.post<CreateCargoItemResponse>(
                "/cargo",
                requestData
            );

            console.log("Груз успешно создан. ID:", response.data.ids);
            return response.data;
        } catch (error: any) {
            console.error("ERROR Ошибка создания груза:", error);

            // Детальная информация об ошибке
            if (error.response) {
                console.error("Статус ошибки:", error.response.status);
                console.error("Данные ошибки:", error.response.data);
                console.error("URL запроса:", error.config?.url);

                // Пробрасываем ошибку с дополнительной информацией
                const apiError = new Error(
                    `Ошибка создания груза: ${
                        error.response.status
                    } - ${JSON.stringify(error.response.data)}`
                );
                (apiError as any).status = error.response.status;
                (apiError as any).data = error.response.data;
                throw apiError;
            }

            // Если это валидационная ошибка
            if (
                error.message.includes("отсутствует обязательное поле") ||
                error.message.includes("должны быть положительными числами")
            ) {
                throw error;
            }

            // Сетевая ошибка
            throw new Error(`Ошибка соединения: ${error.message}`);
        }
    },

    // Вспомогательная функция для создания одного груза
    createSingleCargo: async (
        cargoData: Omit<CargoItem, "cargoRequestId"> & {
            cargoRequestId?: string;
        }
    ): Promise<number> => {
        // Если cargoRequestId не указан, пытаемся получить его из контекста
        const cargoRequestId = cargoData.cargoRequestId;

        if (!cargoRequestId) {
            throw new Error("Не указан cargoRequestId (uuid) для груза");
        }

        const cargoItem: CargoItem = {
            length: cargoData.length,
            height: cargoData.height,
            width: cargoData.width,
            weight: cargoData.weight,
            cargoType: cargoData.cargoType,
            description: cargoData.description || "",
            worth: cargoData.worth || 0,
            cargoRequestId: cargoRequestId,
        };

        const response = await cargoRequestsApi.createCargo([cargoItem]);

        // Возвращаем первый созданный ID
        if (response.ids && response.ids.length > 0) {
            return response.ids[0];
        }

        throw new Error("Не получен ID созданного груза");
    },
};
