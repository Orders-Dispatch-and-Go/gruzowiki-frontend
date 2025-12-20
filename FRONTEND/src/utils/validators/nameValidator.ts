export const validateName = (_: any, value: string) => {
    const cyrillicRegex = /^[а-яА-ЯёЁ\s\-]*$/;
    
    // Если поле пустое - пропускаем (required проверит отдельно)
    if (!value || value.trim() === '') {
        return Promise.resolve();
    }
    
    if (!cyrillicRegex.test(value)) {
        return Promise.reject(new Error("Только кириллица, пробелы и дефисы"));
    }
    
    return Promise.resolve();
};