// Модуль для работы с серверным API рейтинга

const ServerAPI = {
    // URL сервера (можно изменить в настройках)
    // Приоритет: window.SERVER_URL > AppConfig.SERVER_URL > значение по умолчанию
    get serverUrl() {
        if (window.SERVER_URL) {
            return window.SERVER_URL;
        }
        if (window.AppConfig && window.AppConfig.getServerUrl) {
            return window.AppConfig.getServerUrl();
        }
        return 'https://your-server-url.onrender.com';
    },
    
    // Проверка доступности сервера
    async checkServer() {
        try {
            const response = await fetch(`${this.serverUrl}/api/health`);
            const data = await response.json();
            return data.status === 'ok';
        } catch (error) {
            console.warn('Сервер недоступен:', error);
            return false;
        }
    },
    
    // Отправка результата на сервер
    async saveResult(result) {
        try {
            // Убеждаемся, что есть имя пользователя
            if (!result.userName || result.userName === 'Пользователь') {
                if (window.currentUserInfo && window.currentUserInfo.name) {
                    result.userName = window.currentUserInfo.name;
                } else if (typeof Storage !== 'undefined') {
                    const settings = Storage.getSettings();
                    if (settings.defaultName && String(settings.defaultName).trim()) {
                        result.userName = String(settings.defaultName).trim();
                    } else {
                        result.userName = 'Анонимный пользователь';
                    }
                } else {
                    result.userName = 'Анонимный пользователь';
                }
            }
            
            const response = await fetch(`${this.serverUrl}/api/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Результат отправлен на сервер:', data);
            return data;
        } catch (error) {
            console.error('Ошибка при отправке результата на сервер:', error);
            // Не блокируем работу приложения, если сервер недоступен
            return null;
        }
    },
    
    // Получение рейтинга с сервера
    async getLeaderboard(filter = 'all') {
        try {
            const response = await fetch(`${this.serverUrl}/api/leaderboard?filter=${filter}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const leaderboard = await response.json();
            return leaderboard;
        } catch (error) {
            console.error('Ошибка при получении рейтинга с сервера:', error);
            // Возвращаем пустой массив при ошибке
            return [];
        }
    },
    
    // Получение статистики с сервера
    async getStats() {
        try {
            const response = await fetch(`${this.serverUrl}/api/stats`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const stats = await response.json();
            return stats;
        } catch (error) {
            console.error('Ошибка при получении статистики с сервера:', error);
            return null;
        }
    }
};
