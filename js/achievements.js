// Система достижений

const Achievements = {
    filterCategory: 'all',
    filterStatus: 'all',

    categoryLabels: {
        general: 'Общие',
        iq: 'IQ',
        performance: 'Результаты',
        category: 'По категориям',
        difficulty: 'Сложность',
        progress: 'Прогресс'
    },

    // Все достижения
    allAchievements: [
        {
            id: 'first_test',
            name: 'Первый шаг',
            description: 'Пройдите свой первый тест IQ',
            icon: '🎯',
            condition: (stats) => stats.totalTests >= 1,
            category: 'general'
        },
        {
            id: 'iq_130',
            name: 'Гений',
            description: 'Достигните IQ 130 или выше',
            icon: '🧠',
            condition: (stats) => stats.maxIQ >= 130,
            category: 'iq'
        },
        {
            id: 'iq_120',
            name: 'Высокий интеллект',
            description: 'Достигните IQ 120 или выше',
            icon: '⭐',
            condition: (stats) => stats.maxIQ >= 120,
            category: 'iq'
        },
        {
            id: 'perfect_score',
            name: 'Идеальный результат',
            description: 'Ответьте правильно на все вопросы',
            icon: '💯',
            condition: (result) => result && result.percentage === 100,
            category: 'performance'
        },
        {
            id: 'fast_thinker',
            name: 'Быстрое мышление',
            description: 'Завершите тест менее чем за половину отведенного времени',
            icon: '⚡',
            condition: (result) => {
                if (!result) return false;
                const timeLimit = result.difficulty === 'easy' ? 1800 : result.difficulty === 'medium' ? 2400 : 2700;
                return result.timeSpent < timeLimit / 2;
            },
            category: 'performance'
        },
        {
            id: 'math_master',
            name: 'Мастер математики',
            description: 'Получите 100% в категории "Математика"',
            icon: '🔢',
            condition: (result) => result && result.categoryBreakdown && result.categoryBreakdown['Математика'] === 100,
            category: 'category'
        },
        {
            id: 'logic_master',
            name: 'Мастер логики',
            description: 'Получите 100% в категории "Логика"',
            icon: '🧩',
            condition: (result) => result && result.categoryBreakdown && result.categoryBreakdown['Логика'] === 100,
            category: 'category'
        },
        {
            id: 'spatial_master',
            name: 'Пространственный гений',
            description: 'Получите 100% в категории "Пространственное"',
            icon: '📐',
            condition: (result) => result && result.categoryBreakdown && result.categoryBreakdown['Пространственное'] === 100,
            category: 'category'
        },
        {
            id: 'verbal_master',
            name: 'Вербальный мастер',
            description: 'Получите 100% в категории "Вербальные"',
            icon: '📝',
            condition: (result) => result && result.categoryBreakdown && result.categoryBreakdown['Вербальные'] === 100,
            category: 'category'
        },
        {
            id: 'ten_tests',
            name: 'Опытный тестируемый',
            description: 'Пройдите 10 тестов',
            icon: '🏅',
            condition: (stats) => stats.totalTests >= 10,
            category: 'general'
        },
        {
            id: 'twenty_tests',
            name: 'Ветеран тестов',
            description: 'Пройдите 20 тестов',
            icon: '🎖️',
            condition: (stats) => stats.totalTests >= 20,
            category: 'general'
        },
        {
            id: 'improvement',
            name: 'Прогресс',
            description: 'Улучшите свой IQ на 10 баллов',
            icon: '📈',
            condition: (stats) => {
                if (stats.totalTests < 2) return false;
                const results = Storage.getResults();
                if (results.length < 2) return false;
                const sorted = results.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                const firstIQ = sorted[0].iq;
                const lastIQ = sorted[sorted.length - 1].iq;
                return lastIQ - firstIQ >= 10;
            },
            category: 'progress'
        },
        {
            id: 'hard_mode',
            name: 'Экстремал',
            description: 'Пройдите сложный тест',
            icon: '🔥',
            condition: (result) => result && result.difficulty === 'hard',
            category: 'difficulty'
        },
        {
            id: 'consistent',
            name: 'Стабильность',
            description: 'Получите одинаковый IQ в 3 тестах подряд',
            icon: '🎯',
            condition: (stats) => {
                const results = Storage.getResults();
                if (results.length < 3) return false;
                const lastThree = results.slice(-3);
                return lastThree.every(r => Math.abs(r.iq - lastThree[0].iq) <= 2);
            },
            category: 'progress'
        },
        {
            id: 'all_categories_90',
            name: 'Универсал',
            description: 'Получите 90%+ во всех категориях',
            icon: '🌟',
            condition: (result) => {
                if (!result || !result.categoryBreakdown) return false;
                return Object.values(result.categoryBreakdown).every(score => score >= 90);
            },
            category: 'performance'
        }
    ],

    // Получить разблокированные достижения
    getUnlockedAchievements() {
        const unlocked = localStorage.getItem('iqTestAchievements');
        return unlocked ? JSON.parse(unlocked) : [];
    },

    // Сохранить достижение
    unlockAchievement(achievementId) {
        const unlocked = this.getUnlockedAchievements();
        if (!unlocked.includes(achievementId)) {
            unlocked.push(achievementId);
            localStorage.setItem('iqTestAchievements', JSON.stringify(unlocked));
            return true;
        }
        return false;
    },

    // Проверить и разблокировать достижения
    checkAchievements(result = null) {
        const stats = Storage.getStatistics();
        const unlocked = this.getUnlockedAchievements();
        const newlyUnlocked = [];

        this.allAchievements.forEach(achievement => {
            if (!unlocked.includes(achievement.id)) {
                let isUnlocked = false;
                
                if (achievement.condition.length === 1) {
                    // Проверка на основе статистики или результата
                    if (achievement.category === 'general' || achievement.category === 'iq' || achievement.category === 'progress') {
                        isUnlocked = achievement.condition(stats);
                    } else {
                        isUnlocked = achievement.condition(result);
                    }
                } else {
                    isUnlocked = achievement.condition(stats, result);
                }

                if (isUnlocked) {
                    this.unlockAchievement(achievement.id);
                    newlyUnlocked.push(achievement);
                }
            }
        });

        return newlyUnlocked;
    },

    // Получить достижения для отображения
    getAchievementsForDisplay() {
        const unlocked = this.getUnlockedAchievements();
        return this.allAchievements.map(achievement => ({
            ...achievement,
            unlocked: unlocked.includes(achievement.id)
        }));
    },

    // Получить достижения по категории
    getAchievementsByCategory(category) {
        return this.allAchievements.filter(a => a.category === category);
    },

    getFilteredForDisplay() {
        let list = this.getAchievementsForDisplay();
        if (this.filterCategory !== 'all') {
            list = list.filter(a => a.category === this.filterCategory);
        }
        if (this.filterStatus === 'unlocked') {
            list = list.filter(a => a.unlocked);
        } else if (this.filterStatus === 'locked') {
            list = list.filter(a => !a.unlocked);
        }
        return list;
    },

    updateProgress() {
        const unlocked = this.getUnlockedAchievements();
        const total = this.allAchievements.length;
        const count = unlocked.length;
        const percent = total ? Math.round((count / total) * 100) : 0;
        const countEl = document.getElementById('unlocked-count');
        const totalEl = document.getElementById('total-count');
        const fillEl = document.getElementById('achievements-progress-fill');
        const percentEl = document.getElementById('achievements-percent');
        if (countEl) countEl.textContent = count;
        if (totalEl) totalEl.textContent = total;
        if (fillEl) fillEl.style.width = percent + '%';
        if (percentEl) percentEl.textContent = percent + '%';
    },

    setupFilters() {
        const categoryBtns = document.querySelectorAll('.achievement-filter-btn');
        const statusBtns = document.querySelectorAll('.achievement-status-btn');
        if (categoryBtns.length && !categoryBtns[0].dataset.bound) {
            categoryBtns[0].dataset.bound = '1';
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (typeof Sounds !== 'undefined') Sounds.playClick();
                    document.querySelectorAll('.achievement-filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filterCategory = btn.dataset.category;
                    this.renderList();
                });
            });
        }
        if (statusBtns.length && !statusBtns[0].dataset.bound) {
            statusBtns[0].dataset.bound = '1';
            statusBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (typeof Sounds !== 'undefined') Sounds.playClick();
                    document.querySelectorAll('.achievement-status-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filterStatus = btn.dataset.status;
                    this.renderList();
                });
            });
        }
    },

    renderList() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        const list = this.getFilteredForDisplay();
        this.updateProgress();

        if (!list || list.length === 0) {
            container.innerHTML = '<div class="achievements-empty"><p>Нет достижений по выбранным фильтрам</p></div>';
            return;
        }

        const categoryLabel = (cat) => this.categoryLabels[cat] || cat;
        container.innerHTML = list.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}" data-id="${achievement.id}">
                <div class="achievement-card-icon">${achievement.icon}</div>
                <span class="achievement-card-category">${categoryLabel(achievement.category)}</span>
                <div class="achievement-card-name">${achievement.name}</div>
                <div class="achievement-card-description">${achievement.description}</div>
            </div>
        `).join('');
    },

    init() {
        this.setupFilters();
        this.renderList();
    }
};
