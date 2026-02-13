// Модуль для общего рейтинга всех пользователей
// Использует JSONBin.io для хранения данных

const SharedLeaderboard = {
    apiUrl: 'https://api.jsonbin.io/v3/b',
    binId: null, // Будет создан автоматически при первом использовании
    masterKey: '$2a$10$YourMasterKeyHere', // Замените на свой ключ с jsonbin.io (бесплатно)
    
    // Инициализация - создание или получение bin ID
    async init() {
        // Используем фиксированный bin ID для общего рейтинга
        // Если bin не существует, создадим его при первой записи
        const storedBinId = localStorage.getItem('sharedLeaderboardBinId');
        if (storedBinId) {
            this.binId = storedBinId;
        } else {
            // Создадим новый bin при первом использовании
            await this.createBin();
        }
    },
    
    // Создание нового bin
    async createBin() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey,
                    'X-Bin-Name': 'IQ Test Leaderboard'
                },
                body: JSON.stringify({ results: [] })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.binId = data.metadata.id;
                localStorage.setItem('sharedLeaderboardBinId', this.binId);
                console.log('Создан новый bin для общего рейтинга:', this.binId);
            }
        } catch (error) {
            console.error('Ошибка при создании bin:', error);
            // Используем фиксированный ID для демо
            this.binId = '675a8f8e266cfc1fde1b1234'; // Замените на реальный ID
        }
    },
    
    // Получение общего рейтинга
    async getSharedLeaderboard() {
        if (!this.binId) {
            await this.init();
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.masterKey
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.record.results || [];
            } else if (response.status === 404) {
                // Bin не существует, создадим новый
                await this.createBin();
                return [];
            }
        } catch (error) {
            console.error('Ошибка при получении общего рейтинга:', error);
            // Fallback на локальный рейтинг
            return Storage.getResults();
        }
        
        return [];
    },
    
    // Добавление результата в общий рейтинг
    async addResult(result) {
        if (!this.binId) {
            await this.init();
        }
        
        try {
            // Получаем текущие результаты
            const currentResults = await this.getSharedLeaderboard();
            
            // Добавляем новый результат
            const newResult = {
                ...result,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userName: result.userName || 'Анонимный пользователь'
            };
            
            currentResults.push(newResult);
            
            // Сохраняем обратно
            const response = await fetch(`${this.apiUrl}/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.masterKey
                },
                body: JSON.stringify({ results: currentResults })
            });
            
            if (response.ok) {
                console.log('Результат добавлен в общий рейтинг');
                return true;
            }
        } catch (error) {
            console.error('Ошибка при добавлении результата в общий рейтинг:', error);
        }
        
        return false;
    },
    
    // Получение отфильтрованного рейтинга
    async getFilteredLeaderboard(filter = 'all') {
        const results = await this.getSharedLeaderboard();
        
        if (results.length === 0) return [];
        
        let filteredResults = [...results];
        
        if (filter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredResults = results.filter(r => new Date(r.timestamp) >= monthAgo);
        } else if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredResults = results.filter(r => new Date(r.timestamp) >= weekAgo);
        }
        
        // Группируем по пользователям и берем лучший результат каждого
        const userBestResults = {};
        filteredResults.forEach(result => {
            const userId = result.userName || 'Анонимный пользователь';
            if (!userBestResults[userId] || result.iq > userBestResults[userId].iq) {
                userBestResults[userId] = {
                    ...result,
                    userName: userId,
                    testCount: 1
                };
            } else {
                userBestResults[userId].testCount++;
            }
        });
        
        // Сортируем по IQ
        const leaderboard = Object.values(userBestResults)
            .sort((a, b) => b.iq - a.iq)
            .map((result, index) => ({
                ...result,
                rank: index + 1
            }));
        
        return leaderboard;
    }
};
