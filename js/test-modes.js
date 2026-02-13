// Модуль для управления режимами теста

const TestModes = {
    currentMode: 'standard', // standard, practice, quick
    selectedCategories: ['logic', 'math', 'spatial', 'verbal', 'analogy', 'pattern'],

    // Инициализация
    init() {
        this.setupModeSelector();
        this.setupCategoryFilters();
        this.setupTipsToggle();
        this.updateModeDescription();
    },

    // Настройка выбора режима
    setupModeSelector() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMode = btn.dataset.mode;
                this.updateModeDescription();
            });
        });
    },

    // Обновление описания режима
    updateModeDescription() {
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            const desc = btn.querySelector('.difficulty-desc');
            if (!desc) return;

            const difficulty = btn.dataset.difficulty;
            let text = '';

            if (this.currentMode === 'quick') {
                text = '10 вопросов, 10 минут';
            } else if (this.currentMode === 'practice') {
                const counts = { easy: '20 вопросов', medium: '35 вопросов', hard: '50 вопросов' };
                const times = { easy: 'без ограничения', medium: 'без ограничения', hard: 'без ограничения' };
                text = `${counts[difficulty] || ''}, ${times[difficulty] || ''}`;
            } else {
                const counts = { easy: '20 вопросов', medium: '35 вопросов', hard: '50 вопросов' };
                const times = { easy: '30 минут', medium: '40 минут', hard: '45 минут' };
                text = `${counts[difficulty] || ''}, ${times[difficulty] || ''}`;
            }

            desc.textContent = text;
        });
        this.updateInfoSection();
    },

    // Обновление блока "Информация о тесте" на главной
    updateInfoSection() {
        const infoEl = document.getElementById('total-questions-info');
        if (!infoEl) return;
        const activeDifficulty = document.querySelector('.difficulty-btn.active');
        const difficulty = activeDifficulty ? activeDifficulty.dataset.difficulty : 'medium';
        if (this.currentMode === 'quick') {
            infoEl.textContent = '10';
        } else {
            const counts = { easy: '20', medium: '35', hard: '50' };
            infoEl.textContent = counts[difficulty] || '35';
        }
    },

    // Настройка фильтров категорий
    setupCategoryFilters() {
        const checkboxes = document.querySelectorAll('.category-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                this.updateSelectedCategories();
            });
        });

        const selectAllBtn = document.getElementById('select-all-categories');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                checkboxes.forEach(cb => {
                    cb.checked = !allChecked;
                });
                this.updateSelectedCategories();
                selectAllBtn.textContent = allChecked ? 'Выбрать все' : 'Снять все';
            });
        }
    },

    // Обновление выбранных категорий
    updateSelectedCategories() {
        const checkboxes = document.querySelectorAll('.category-checkbox:checked');
        this.selectedCategories = Array.from(checkboxes).map(cb => cb.value);
        
        if (this.selectedCategories.length === 0) {
            // Если ничего не выбрано, выбираем все
            document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = true);
            this.selectedCategories = ['logic', 'math', 'spatial', 'verbal', 'analogy', 'pattern'];
        }
    },

    // Настройка переключения подсказок
    setupTipsToggle() {
        const toggleBtn = document.getElementById('toggle-tips');
        const tipsContent = document.getElementById('tips-content');
        
        if (toggleBtn && tipsContent) {
            toggleBtn.addEventListener('click', () => {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                const isHidden = tipsContent.classList.contains('hidden');
                
                if (isHidden) {
                    tipsContent.classList.remove('hidden');
                    toggleBtn.innerHTML = '<span>💡</span> Скрыть советы';
                } else {
                    tipsContent.classList.add('hidden');
                    toggleBtn.innerHTML = '<span>💡</span> Показать советы перед тестом';
                }
            });
        }
    },

    // Получить параметры теста на основе режима
    getTestParams(difficulty) {
        const params = {
            standard: {
                easy: { count: 20, timeLimit: 1800 },
                medium: { count: 35, timeLimit: 2400 },
                hard: { count: 50, timeLimit: 2700 }
            },
            practice: {
                easy: { count: 20, timeLimit: null }, // null = без ограничения
                medium: { count: 35, timeLimit: null },
                hard: { count: 50, timeLimit: null }
            },
            quick: {
                easy: { count: 10, timeLimit: 600 },
                medium: { count: 10, timeLimit: 600 },
                hard: { count: 10, timeLimit: 600 }
            }
        };

        return params[this.currentMode]?.[difficulty] || params.standard[difficulty];
    },

    // Фильтрация вопросов по категориям
    filterQuestionsByCategory(questions) {
        if (!this.selectedCategories || this.selectedCategories.length === 0) {
            return questions;
        }

        return questions.filter(q => {
            return this.selectedCategories.includes(q.category);
        });
    }
};
