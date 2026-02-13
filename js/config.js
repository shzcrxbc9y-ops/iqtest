// Конфигурация приложения
// Обновите SERVER_URL после развертывания сервера на Render.com

const AppConfig = {
    // URL сервера для глобального рейтинга
    // После развертывания сервера на Render.com:
    // 1. Скопируйте URL вашего сервера (например: https://iq-test-server.onrender.com)
    // 2. Раскомментируйте строку ниже и вставьте ваш URL
    // 3. Или обновите window.SERVER_URL в index.html (строка ~732)
    
    SERVER_URL: null, // Раскомментируйте и укажите URL: 'https://your-server.onrender.com'
    
    // Автоматическое определение URL из window.SERVER_URL или использование значения по умолчанию
    getServerUrl() {
        return window.SERVER_URL || this.SERVER_URL || 'https://your-server-url.onrender.com';
    }
};

// Экспорт для использования в других модулях
window.AppConfig = AppConfig;
