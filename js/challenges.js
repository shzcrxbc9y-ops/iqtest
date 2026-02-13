// Система заданий и челленджей — расширенная и интересная

const Challenges = {
    DAILY_BONUS_POINTS: 20,
    countdownInterval: null,

    // Пул ежедневных заданий (каждый день выбираются 3 случайных)
    dailyPool: [
        { id: 'daily_test', name: 'Первый тест дня', description: 'Пройдите любой тест IQ сегодня', icon: '📅', reward: 15, difficulty: 'easy' },
        { id: 'perfect_score', name: 'Без единой ошибки', description: 'Ответьте правильно на все вопросы в одном тесте', icon: '💯', reward: 50, difficulty: 'hard' },
        { id: 'fast_completion', name: 'Скоростной результат', description: 'Завершите тест за половину отведённого времени', icon: '⚡', reward: 35, difficulty: 'medium' },
        { id: 'quick_mode', name: 'Быстрый режим', description: 'Пройдите тест в режиме «Быстрый» (10 вопросов)', icon: '🎯', reward: 20, difficulty: 'easy' },
        { id: 'hard_mode', name: 'Эксперт', description: 'Пройдите тест на сложном уровне', icon: '🔥', reward: 40, difficulty: 'hard' },
        { id: 'iq_110_plus', name: 'Выше среднего', description: 'Наберите IQ не ниже 110 в одном тесте', icon: '📈', reward: 25, difficulty: 'medium' },
        { id: 'category_logic', name: 'Мастер логики', description: 'Получите 100% в категории «Логика» в одном тесте', icon: '🧩', reward: 30, difficulty: 'medium' },
        { id: 'practice_mode', name: 'Без спешки', description: 'Пройдите тест в режиме «Практика» до конца', icon: '📚', reward: 15, difficulty: 'easy' }
    ],

    permanentChallenges: [
        { id: 'master_all', name: 'Универсал', description: 'Получите 90%+ во всех категориях в одном тесте', icon: '🌟', reward: 100, progress: 0, target: 1 },
        { id: 'iq_130_5_times', name: 'Гений 5 раз', description: 'Достигните IQ 130+ в пяти разных тестах', icon: '🧠', reward: 200, progress: 0, target: 5 },
        { id: 'streak_7', name: 'Неделя подряд', description: 'Пройдите тест 7 дней подряд', icon: '🔥', reward: 150, progress: 0, target: 7 },
        { id: 'total_tests_25', name: 'Опытный', description: 'Пройдите 25 тестов', icon: '🎖️', reward: 150, progress: 0, target: 25 },
        { id: 'total_tests_50', name: 'Ветеран', description: 'Пройдите 50 тестов', icon: '🏆', reward: 300, progress: 0, target: 50 },
        { id: 'improvement_15', name: 'Рост на 15', description: 'Улучшите свой лучший IQ на 15 баллов', icon: '📈', reward: 120, progress: 0, target: 1 }
    ],

    getStorageKey(dateStr) {
        return 'challenges_daily_' + (dateStr || new Date().toDateString());
    },

    getTodayChallenges() {
        const today = new Date().toDateString();
        const key = this.getStorageKey(today);
        try {
            const stored = localStorage.getItem(key);
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        const shuffled = [...this.dailyPool].sort(() => Math.random() - 0.5);
        const daily = shuffled.slice(0, 3).map(c => ({ ...c, completed: false }));
        try {
            localStorage.setItem(key, JSON.stringify(daily));
        } catch (e) {}
        return daily;
    },

    saveTodayChallenges(challenges) {
        const key = this.getStorageKey(new Date().toDateString());
        try {
            localStorage.setItem(key, JSON.stringify(challenges));
        } catch (e) {}
    },

    getTimeUntilReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const ms = tomorrow - now;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return { h, m, s, str: [h, m, s].map(x => String(x).padStart(2, '0')).join(':') };
    },

    startCountdown() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        const el = document.getElementById('challenges-reset-countdown');
        if (!el) return;
        const update = () => {
            const t = this.getTimeUntilReset();
            el.textContent = t.str;
        };
        update();
        this.countdownInterval = setInterval(update, 1000);
    },

    getCompletedTodayCount() {
        const daily = this.getTodayChallenges();
        return daily.filter(c => c.completed).length;
    },

    getTotalPoints() {
        return parseInt(localStorage.getItem('iqTestPoints') || '0', 10);
    },

    addPoints(points) {
        const current = this.getTotalPoints();
        localStorage.setItem('iqTestPoints', String(current + points));
        if (typeof Utils !== 'undefined') Utils.showToast('+' + points + ' очков!', 'success');
    },

    getRewardPoints(reward) {
        if (typeof reward === 'number') return reward;
        const match = String(reward).match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    },

    getClaimedPermanent() {
        try {
            const s = localStorage.getItem('challenges_claimed_permanent');
            return s ? JSON.parse(s) : [];
        } catch (e) { return []; }
    },

    setClaimedPermanent(id) {
        const arr = this.getClaimedPermanent();
        if (!arr.includes(id)) arr.push(id);
        localStorage.setItem('challenges_claimed_permanent', JSON.stringify(arr));
    },

    checkChallenges(result) {
        if (!result) return [];
        const today = new Date().toDateString();
        const challenges = this.getTodayChallenges();
        const completed = [];

        challenges.forEach(challenge => {
            if (challenge.completed) return;
            let done = false;
            switch (challenge.id) {
                case 'daily_test':
                    done = true;
                    break;
                case 'perfect_score':
                    done = result.percentage === 100;
                    break;
                case 'fast_completion':
                    if (result.timeSpent != null && result.difficulty) {
                        const limit = result.difficulty === 'easy' ? 1800 : result.difficulty === 'medium' ? 2400 : 2700;
                        if (result.timeLimit) done = result.timeSpent < result.timeLimit / 2;
                        else done = result.timeSpent < limit / 2;
                    }
                    break;
                case 'quick_mode':
                    done = result.testMode === 'quick';
                    break;
                case 'hard_mode':
                    done = result.difficulty === 'hard';
                    break;
                case 'iq_110_plus':
                    done = result.iq >= 110;
                    break;
                case 'category_logic':
                    done = result.categoryBreakdown && result.categoryBreakdown['Логика'] === 100;
                    break;
                case 'practice_mode':
                    done = result.testMode === 'practice';
                    break;
                default:
                    break;
            }
            if (done) {
                challenge.completed = true;
                completed.push(challenge);
                this.addPoints(challenge.reward || this.getRewardPoints(challenge.reward));
            }
        });

        this.saveTodayChallenges(challenges);
        const doneCount = challenges.filter(c => c.completed).length;
        if (doneCount === 3 && !localStorage.getItem('challenges_daily_bonus_' + today)) {
            localStorage.setItem('challenges_daily_bonus_' + today, '1');
            this.addPoints(this.DAILY_BONUS_POINTS);
            if (typeof Utils !== 'undefined') Utils.showToast('Бонус за все задания дня: +' + this.DAILY_BONUS_POINTS + ' очков!', 'success');
        }
        return completed;
    },

    updatePermanentProgress() {
        if (typeof Storage === 'undefined') return;
        const results = Storage.getResults();
        const stats = Storage.getStatistics();
        const claimed = this.getClaimedPermanent();
        const longestStreak = typeof Activity !== 'undefined' ? Activity.getLongestStreak() : 0;
        const iq130Count = results ? results.filter(r => r && r.iq >= 130).length : 0;
        const totalTests = stats ? stats.totalTests : 0;
        const maxIQ = stats ? stats.maxIQ : 0;
        const sorted = results && results.length ? [...results].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : [];
        const firstIQ = sorted.length ? sorted[0].iq : 0;
        const improvement = maxIQ && firstIQ ? maxIQ - firstIQ : 0;
        let masterAllDone = false;
        if (results && results.length) {
            masterAllDone = results.some(r => r.categoryBreakdown && Object.values(r.categoryBreakdown).every(v => v >= 90));
        }
        return this.permanentChallenges.map(c => {
            let progress = 0;
            switch (c.id) {
                case 'master_all':
                    progress = masterAllDone ? 1 : 0;
                    break;
                case 'iq_130_5_times':
                    progress = Math.min(iq130Count, 5);
                    break;
                case 'streak_7':
                    progress = Math.min(longestStreak, 7);
                    break;
                case 'total_tests_25':
                    progress = Math.min(totalTests, 25);
                    break;
                case 'total_tests_50':
                    progress = Math.min(totalTests, 50);
                    break;
                case 'improvement_15':
                    progress = improvement >= 15 ? 1 : 0;
                    break;
                default:
                    break;
            }
            return { ...c, progress, claimed: claimed.includes(c.id) };
        });
    },

    updateKPI() {
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        set('challenges-total-points', this.getTotalPoints());
        set('challenges-done-today', this.getCompletedTodayCount() + '/3');
        const streak = typeof Activity !== 'undefined' ? Activity.getCurrentStreak() : 0;
        set('challenges-streak', streak);
        const t = this.getTimeUntilReset();
        set('challenges-reset-countdown', t.str);
        this.startCountdown();
    },

    renderFeatured() {
        const wrap = document.getElementById('challenge-featured-wrap');
        if (!wrap) return;
        const daily = this.getTodayChallenges();
        const first = daily.find(c => !c.completed);
        if (!first) {
            wrap.innerHTML = '<div class="challenge-featured-card completed"><div class="challenge-featured-body">🎉 Все задания на сегодня выполнены! Заходите завтра.</div></div>';
            return;
        }
        wrap.innerHTML = `
            <div class="challenge-featured-card">
                <span class="challenge-featured-badge">Вызов дня</span>
                <div class="challenge-featured-icon">${first.icon}</div>
                <div class="challenge-featured-name">${first.name}</div>
                <div class="challenge-featured-desc">${first.description}</div>
                <div class="challenge-featured-reward">+${first.reward} очков</div>
            </div>
        `;
    },

    setupTabs() {
        const tabs = document.querySelectorAll('.challenges-tab');
        const panels = document.querySelectorAll('.challenges-panel');
        if (!tabs.length || tabs[0].dataset.bound) return;
        tabs[0].dataset.bound = '1';
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                const tabName = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => {
                    p.classList.toggle('active', p.id === 'challenges-' + tabName + '-panel');
                });
                tab.classList.add('active');
            });
        });
    },

    displayChallenges() {
        this.updateKPI();
        this.renderFeatured();

        const dailyContainer = document.getElementById('daily-challenges');
        if (dailyContainer) {
            const daily = this.getTodayChallenges();
            dailyContainer.innerHTML = daily.map(c => `
                <div class="challenge-card ${c.completed ? 'completed' : ''}">
                    <div class="challenge-icon">${c.icon}</div>
                    <span class="challenge-difficulty challenge-difficulty-${(c.difficulty || 'easy')}">${c.difficulty === 'hard' ? 'Сложно' : c.difficulty === 'medium' ? 'Средне' : 'Легко'}</span>
                    <div class="challenge-content">
                        <h3>${c.name}</h3>
                        <p>${c.description}</p>
                        <div class="challenge-reward">+${c.reward} очков</div>
                    </div>
                    <div class="challenge-status">${c.completed ? '✓' : '○'}</div>
                </div>
            `).join('');
        }

        const permanentContainer = document.getElementById('permanent-challenges');
        if (permanentContainer && typeof Storage !== 'undefined') {
            const permanent = this.updatePermanentProgress();
            permanentContainer.innerHTML = permanent.map(c => {
                const pct = c.target > 0 ? Math.min(100, (c.progress / c.target) * 100) : 0;
                const done = c.progress >= c.target;
                return `
                    <div class="challenge-card ${done ? 'completed' : ''} ${c.claimed ? 'claimed' : ''}">
                        <div class="challenge-icon">${c.icon}</div>
                        <div class="challenge-content">
                            <h3>${c.name}</h3>
                            <p>${c.description}</p>
                            <div class="challenge-progress">
                                <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>
                                <span class="progress-text">${c.progress} / ${c.target}</span>
                            </div>
                            <div class="challenge-reward">${c.claimed ? 'Получено' : '+' + c.reward + ' очков'}</div>
                        </div>
                        <div class="challenge-status">${c.claimed || done ? '✓' : '○'}</div>
                    </div>
                `;
            }).join('');
        }
    },

    claimPermanentIfNeeded() {
        if (typeof Storage === 'undefined') return;
        const permanent = this.updatePermanentProgress();
        const claimed = this.getClaimedPermanent();
        permanent.forEach(c => {
            if (c.progress >= c.target && !claimed.includes(c.id)) {
                this.setClaimedPermanent(c.id);
                this.addPoints(c.reward);
                if (typeof Utils !== 'undefined') Utils.showToast('Челлендж «' + c.name + '»: +' + c.reward + ' очков!', 'success');
            }
        });
    },

    init() {
        this.setupTabs();
        this.claimPermanentIfNeeded();
        this.displayChallenges();
    }
};
