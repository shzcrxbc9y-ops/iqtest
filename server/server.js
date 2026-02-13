// Сервер для общего рейтинга IQ теста
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'results.json');

// Middleware
app.use(cors());
app.use(express.json());

// Создаем директорию для данных, если её нет
async function ensureDataDir() {
    const dataDir = path.dirname(DATA_FILE);
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        console.error('Ошибка создания директории:', error);
    }
}

// Загрузка данных
async function loadData() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Если файла нет, возвращаем пустой массив
        return [];
    }
}

// Сохранение данных
async function saveData(data) {
    try {
        await ensureDataDir();
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        return false;
    }
}

// Генерация уникального ID пользователя
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Получение или создание ID пользователя
function getOrCreateUserId(userName, userAgent) {
    // Простая генерация ID на основе имени и браузера
    // В реальном приложении лучше использовать cookies или localStorage на клиенте
    const hash = userName + (userAgent || '');
    return 'user_' + hash.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

// API: Сохранение результата
app.post('/api/results', async (req, res) => {
    try {
        const result = req.body;
        
        // Валидация данных
        if (!result.iq || !result.userName) {
            return res.status(400).json({ error: 'Необходимы поля: iq, userName' });
        }

        const results = await loadData();
        
        // Добавляем метаданные
        const newResult = {
            ...result,
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent'] || '',
            ip: req.ip || req.connection.remoteAddress
        };

        results.push(newResult);
        
        // Сохраняем только последние 10000 результатов (чтобы файл не был слишком большим)
        const trimmedResults = results.slice(-10000);
        
        const saved = await saveData(trimmedResults);
        
        if (saved) {
            res.json({ success: true, id: newResult.id });
        } else {
            res.status(500).json({ error: 'Ошибка сохранения данных' });
        }
    } catch (error) {
        console.error('Ошибка при сохранении результата:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// API: Получение рейтинга
app.get('/api/leaderboard', async (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        const results = await loadData();

        if (results.length === 0) {
            return res.json([]);
        }

        let filteredResults = [...results];

        // Фильтрация по времени
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

        res.json(leaderboard);
    } catch (error) {
        console.error('Ошибка при получении рейтинга:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// API: Получение статистики
app.get('/api/stats', async (req, res) => {
    try {
        const results = await loadData();
        
        if (results.length === 0) {
            return res.json({
                totalTests: 0,
                averageIQ: 0,
                maxIQ: 0,
                minIQ: 0,
                totalUsers: 0
            });
        }

        const iqScores = results.map(r => r.iq).filter(iq => iq > 0);
        const avgIQ = iqScores.reduce((a, b) => a + b, 0) / iqScores.length;
        const maxIQ = Math.max(...iqScores);
        const minIQ = Math.min(...iqScores);
        
        const uniqueUsers = new Set(results.map(r => r.userName));
        
        res.json({
            totalTests: results.length,
            averageIQ: Math.round(avgIQ),
            maxIQ,
            minIQ,
            totalUsers: uniqueUsers.size
        });
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 API доступен по адресу: http://localhost:${PORT}/api`);
});
