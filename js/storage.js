// Модуль для работы с локальным хранилищем

const Storage = {
    // Сохранение результатов теста
    saveResult(result) {
        const results = this.getResults();
        results.push({
            ...result,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('iqTestResults', JSON.stringify(results));
        return result.id;
    },

    // Получение всех результатов
    getResults() {
        const stored = localStorage.getItem('iqTestResults');
        return stored ? JSON.parse(stored) : [];
    },

    // Получение результата по ID
    getResult(id) {
        const results = this.getResults();
        return results.find(r => r.id === id);
    },

    // Удаление результата
    deleteResult(id) {
        const results = this.getResults();
        const filtered = results.filter(r => r.id !== id);
        localStorage.setItem('iqTestResults', JSON.stringify(filtered));
    },

    // Очистка всех результатов
    clearResults() {
        localStorage.removeItem('iqTestResults');
    },

    // Получение статистики
    getStatistics() {
        const results = this.getResults();
        if (results.length === 0) {
            return null;
        }

        const iqScores = results.map(r => r.iq);
        const avgIQ = iqScores.reduce((a, b) => a + b, 0) / iqScores.length;
        const maxIQ = Math.max(...iqScores);
        const minIQ = Math.min(...iqScores);

        // Статистика по категориям
        const categoryStats = {};
        results.forEach(result => {
            if (result.categoryBreakdown) {
                Object.keys(result.categoryBreakdown).forEach(category => {
                    if (!categoryStats[category]) {
                        categoryStats[category] = [];
                    }
                    categoryStats[category].push(result.categoryBreakdown[category]);
                });
            }
        });

        const avgCategoryStats = {};
        Object.keys(categoryStats).forEach(category => {
            const scores = categoryStats[category];
            avgCategoryStats[category] = scores.reduce((a, b) => a + b, 0) / scores.length;
        });

        return {
            totalTests: results.length,
            averageIQ: Math.round(avgIQ),
            maxIQ,
            minIQ,
            averageCategoryStats: avgCategoryStats,
            recentResults: results.slice(-10).reverse()
        };
    },

    // Сохранение настроек пользователя
    saveSettings(settings) {
        localStorage.setItem('iqTestSettings', JSON.stringify(settings));
    },

    // Получение настроек пользователя
    getSettings() {
        const stored = localStorage.getItem('iqTestSettings');
        return stored ? JSON.parse(stored) : {
            preferredDifficulty: 'medium',
            showExplanations: true,
            soundEnabled: true
        };
    }
};
