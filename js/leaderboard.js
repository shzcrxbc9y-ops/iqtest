// Система рейтинга и лидерборда

const Leaderboard = {
    currentFilter: 'all',
    sharedLeaderboardUrl: 'https://raw.githubusercontent.com/shzcrxbc9y-ops/iqtest/main/shared-leaderboard.json',
    sharedLeaderboardData: null,
    isLoading: false,

    getCurrentUserName() {
        if (window.currentUserInfo && window.currentUserInfo.name) return window.currentUserInfo.name;
        if (typeof Storage !== 'undefined') {
            const s = Storage.getSettings();
            if (s.defaultName && String(s.defaultName).trim()) return String(s.defaultName).trim();
        }
        return 'Пользователь';
    },

    // Загрузка общего рейтинга (из localStorage и GitHub)
    async loadSharedLeaderboard() {
        if (this.isLoading && this.sharedLeaderboardData) {
            return this.sharedLeaderboardData;
        }
        
        try {
            this.isLoading = true;
            
            // Сначала проверяем localStorage (быстрее и работает офлайн)
            const localShared = localStorage.getItem('sharedLeaderboardResults');
            if (localShared) {
                const parsed = JSON.parse(localShared);
                this.sharedLeaderboardData = parsed;
            }
            
            // Затем пытаемся загрузить с GitHub для синхронизации
            try {
                const response = await fetch(this.sharedLeaderboardUrl + '?t=' + Date.now(), {
                    cache: 'no-cache'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const githubResults = data.results || [];
                    
                    // Объединяем результаты: GitHub + локальные
                    if (githubResults.length > 0) {
                        const merged = [...githubResults];
                        const githubUserNames = new Set(githubResults.map(r => r.userName + '_' + r.id));
                        
                        // Добавляем локальные результаты, которых нет в GitHub
                        if (this.sharedLeaderboardData) {
                            this.sharedLeaderboardData.forEach(local => {
                                const key = local.userName + '_' + local.id;
                                if (!githubUserNames.has(key)) {
                                    merged.push(local);
                                }
                            });
                        }
                        
                        // Обновляем localStorage
                        const trimmed = merged.slice(-1000);
                        localStorage.setItem('sharedLeaderboardResults', JSON.stringify(trimmed));
                        this.sharedLeaderboardData = trimmed;
                    }
                }
            } catch (githubError) {
                console.warn('Не удалось загрузить с GitHub, используем локальные данные:', githubError);
            }
            
            // Если данных нет нигде, возвращаем пустой массив
            if (!this.sharedLeaderboardData) {
                this.sharedLeaderboardData = [];
            }
            
            return this.sharedLeaderboardData;
        } catch (error) {
            console.error('Ошибка при загрузке общего рейтинга:', error);
            return this.sharedLeaderboardData || [];
        } finally {
            this.isLoading = false;
        }
    },

    // Сохранение результата в общий рейтинг (через GitHub API или локально)
    async saveToSharedLeaderboard(result) {
        try {
            // Получаем текущие данные
            let sharedData = await this.loadSharedLeaderboard();
            
            // Добавляем новый результат
            const newResult = {
                ...result,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                userName: result.userName || 'Анонимный пользователь'
            };
            
            sharedData.push(newResult);
            
            // Сохраняем локально для синхронизации
            // Примечание: для реального общего рейтинга нужен сервер или GitHub API с токеном
            // Пока сохраняем в localStorage с пометкой "shared"
            const sharedResults = JSON.parse(localStorage.getItem('sharedLeaderboardResults') || '[]');
            sharedResults.push(newResult);
            // Оставляем только последние 1000 результатов
            const trimmed = sharedResults.slice(-1000);
            localStorage.setItem('sharedLeaderboardResults', JSON.stringify(trimmed));
            
            // Обновляем кэш
            this.sharedLeaderboardData = trimmed;
            
            console.log('Результат добавлен в общий рейтинг (локально)');
        } catch (error) {
            console.error('Ошибка при сохранении в общий рейтинг:', error);
        }
    },

    // Получить рейтинг (объединенный: общий + локальный)
    async getLeaderboard(filter = 'all') {
        // Загружаем общий рейтинг
        const sharedResults = await this.loadSharedLeaderboard();
        
        // Получаем локальные результаты
        const localResults = Storage.getResults();
        
        // Объединяем результаты (приоритет у общих, но добавляем локальные если их нет в общих)
        const allResults = [...sharedResults];
        
        // Добавляем локальные результаты, которых нет в общих (по userName)
        const sharedUserNames = new Set(sharedResults.map(r => r.userName));
        localResults.forEach(local => {
            if (!sharedUserNames.has(local.userName)) {
                allResults.push(local);
            }
        });
        
        if (allResults.length === 0) return [];

        let filteredResults = [...allResults];

        if (filter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredResults = allResults.filter(r => new Date(r.timestamp) >= monthAgo);
        } else if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredResults = allResults.filter(r => new Date(r.timestamp) >= weekAgo);
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
    },

    // Получить позицию пользователя
    async getUserRank(userName) {
        const leaderboard = await this.getLeaderboard('all');
        const userResult = leaderboard.find(r => r.userName === userName);
        return userResult ? userResult.rank : null;
    },

    async updateKPI(leaderboard, currentUser) {
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        if (!leaderboard || leaderboard.length === 0) {
            set('user-rank', '—');
            set('user-best-iq', '—');
            set('total-participants', '0');
            set('leaderboard-top-iq', '—');
            return;
        }
        const userRank = await this.getUserRank(currentUser);
        const userBest = leaderboard.find(r => r && r.userName === currentUser);
        const topEntry = leaderboard[0];
        set('user-rank', userRank ? '#' + userRank : '—');
        set('user-best-iq', userBest ? userBest.iq : '—');
        set('total-participants', leaderboard.length);
        set('leaderboard-top-iq', topEntry && topEntry.iq ? topEntry.iq : '—');
    },

    setupFilters() {
        const btns = document.querySelectorAll('.leaderboard-filter-btn');
        if (!btns.length || btns[0].dataset.bound) return;
        btns[0].dataset.bound = '1';
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                document.querySelectorAll('.leaderboard-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.displayLeaderboard();
            });
        });
    },

    // Отобразить рейтинг
    async displayLeaderboard() {
        const filter = this.currentFilter;
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        if (typeof Storage === 'undefined') {
            container.innerHTML = '<p style="color: var(--text-secondary);">Модуль Storage недоступен</p>';
            return;
        }

        // Показываем индикатор загрузки
        container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Загрузка рейтинга...</p></div>';

        const currentUser = this.getCurrentUserName();

        try {
            const leaderboard = await this.getLeaderboard(filter);
            await this.updateKPI(leaderboard, currentUser);

            if (!leaderboard || leaderboard.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏅</div>
                        <h2>Рейтинг пуст</h2>
                        <p>Пройдите тест, чтобы попасть в рейтинг</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = leaderboard.map((entry, index) => {
                if (!entry) return '';
                const isCurrentUser = entry.userName === currentUser;
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                let dateStr = 'Дата неизвестна';
                try {
                    if (entry.timestamp) dateStr = new Date(entry.timestamp).toLocaleDateString('ru-RU');
                } catch (e) {}
                return `
                    <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}">
                        <div class="leaderboard-rank">
                            <span class="rank-number">${entry.rank || index + 1}</span>
                            ${medal ? `<span class="medal">${medal}</span>` : ''}
                        </div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">
                                ${entry.userName || 'Аноним'}
                                ${isCurrentUser ? '<span class="you-badge">Вы</span>' : ''}
                            </div>
                            <div class="leaderboard-details">
                                <span>IQ: <strong>${entry.iq || 0}</strong></span>
                                <span>Тестов: ${entry.testCount || 1}</span>
                                <span>${dateStr}</span>
                            </div>
                        </div>
                        <div class="leaderboard-score">
                            <div class="score-value">${entry.iq || 0}</div>
                            <div class="score-label">IQ</div>
                        </div>
                    </div>
                `;
            }).filter(html => html).join('');
        } catch (error) {
            console.error('Ошибка при отображении рейтинга:', error);
            container.innerHTML = '<p style="color: var(--text-secondary);">Ошибка загрузки рейтинга</p>';
        }
    },

    async init() {
        this.setupFilters();
        // Загружаем общий рейтинг при инициализации
        await this.loadSharedLeaderboard();
        await this.displayLeaderboard();
    }
};
