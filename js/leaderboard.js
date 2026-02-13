// Система рейтинга и лидерборда

const Leaderboard = {
    currentFilter: 'all',

    getCurrentUserName() {
        if (window.currentUserInfo && window.currentUserInfo.name) return window.currentUserInfo.name;
        if (typeof Storage !== 'undefined') {
            const s = Storage.getSettings();
            if (s.defaultName && String(s.defaultName).trim()) return String(s.defaultName).trim();
        }
        return 'Пользователь';
    },

    // Получить рейтинг (с сервера или локально)
    async getLeaderboard(filter = 'all') {
        // Пытаемся получить с сервера
        if (typeof ServerAPI !== 'undefined' && ServerAPI.serverUrl && ServerAPI.serverUrl !== 'https://your-server-url.herokuapp.com') {
            try {
                const serverLeaderboard = await ServerAPI.getLeaderboard(filter);
                if (serverLeaderboard && serverLeaderboard.length > 0) {
                    return serverLeaderboard;
                }
            } catch (error) {
                console.warn('Не удалось получить рейтинг с сервера, используем локальный:', error);
            }
        }
        
        // Fallback на локальное хранилище
        if (typeof Storage === 'undefined') return [];
        
        const results = Storage.getResults();
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

        // Показываем индикатор загрузки
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Загрузка рейтинга...</div>';

        const currentUser = this.getCurrentUserName();

        try {
            const leaderboard = await this.getLeaderboard(filter);
            this.updateKPI(leaderboard, currentUser);

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

    init() {
        this.setupFilters();
        this.displayLeaderboard();
    }
};
