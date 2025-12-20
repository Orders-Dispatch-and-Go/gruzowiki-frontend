// Валидации
export const validatePhone = (_: any, value: string) => {
    const phoneRegex = /^\+7\d{10}$/;
    if (!value) {
        return Promise.reject(new Error("Обязательное поле"));
    }
    if (!phoneRegex.test(value)) {
        return Promise.reject(new Error("Формат: +7XXXXXXXXXX"));
    }
    return Promise.resolve();
};
