export const validateEmail = (_: any, value: string) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!value) {
        return Promise.reject(new Error("Обязательное поле"));
    }

    if (!emailRegex.test(value)) {
        return Promise.reject(new Error("Формат: example@domain.com"));
    }

    return Promise.resolve();
};
