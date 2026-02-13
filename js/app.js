// Главный файл приложения

// Утилиты
const Utils = {
    // Показ toast уведомления
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Переключение страниц
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
        }

        const navLink = document.querySelector(`[data-page="${pageId.replace('-page', '')}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Автоматическая загрузка данных при переходе на страницы
        if (pageId === 'history-page') {
            setTimeout(() => {
                if (typeof loadHistory === 'function') {
                    loadHistory();
                }
            }, 100);
        } else if (pageId === 'leaderboard-page') {
            setTimeout(() => {
                if (typeof Leaderboard !== 'undefined') {
                    Leaderboard.init();
                }
            }, 100);
        } else if (pageId === 'statistics-page') {
            setTimeout(() => {
                if (typeof Statistics !== 'undefined') {
                    Statistics.init();
                }
            }, 100);
        } else if (pageId === 'achievements-page') {
            setTimeout(() => {
                if (typeof Achievements !== 'undefined') {
                    Achievements.init();
                }
            }, 100);
        } else if (pageId === 'goals-page') {
            setTimeout(() => {
                if (typeof Goals !== 'undefined') {
                    Goals.init();
                }
            }, 100);
        } else if (pageId === 'activity-page') {
            setTimeout(() => {
                if (typeof Activity !== 'undefined') {
                    Activity.init();
                }
            }, 100);
        }
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация приложения...');
    
    // Инициализация темы
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('theme') || 'light';
    } catch (error) {
        console.warn('Не удалось загрузить сохраненную тему:', error);
    }
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggleInit = document.getElementById('theme-toggle');
    if (themeToggleInit) {
        themeToggleInit.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Проверка наличия необходимых элементов
    if (!document.getElementById('home-page')) {
        console.error('Ошибка: элемент home-page не найден!');
    }
    if (!document.getElementById('start-test-btn')) {
        console.error('Ошибка: кнопка start-test-btn не найдена!');
    }
    
    // Мобильное меню
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            Sounds.playClick();
        });
        
        // Закрытие меню при клике на ссылку
        const navLinkButtons = navLinks.querySelectorAll('.nav-link');
        navLinkButtons.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            });
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                !navLinks.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) &&
                navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }
    
    // Навигация
    const allNavLinks = document.querySelectorAll('.nav-link');
    console.log('Найдено навигационных ссылок:', allNavLinks.length);
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            Sounds.playClick();
            const page = this.dataset.page;
            console.log('Переход на страницу:', page);
            if (page === 'test' && (typeof TestEngine === 'undefined' || TestEngine.questions.length === 0)) {
                Utils.showToast('Сначала выберите уровень сложности на главной странице', 'info');
                Utils.showPage('home-page');
            } else {
                Utils.showPage(page + '-page');
            }
        });
    });

    // Выбор уровня сложности
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    console.log('Найдено кнопок сложности:', difficultyBtns.length);
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            Sounds.playClick();
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            console.log('Выбрана сложность:', this.dataset.difficulty);
            if (typeof TestModes !== 'undefined' && TestModes.updateInfoSection) TestModes.updateInfoSection();
        });
    });

    // Кнопка начала теста
    const startBtn = document.getElementById('start-test-btn');
    console.log('Кнопка начала теста найдена:', !!startBtn);
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            Sounds.playClick();
            console.log('Клик по кнопке начала теста');
            const activeDifficulty = document.querySelector('.difficulty-btn.active');
            if (!activeDifficulty) {
                Utils.showToast('Выберите уровень сложности', 'error');
                return;
            }

            // Проверка возраста
            const ageInput = document.getElementById('user-age');
            const age = ageInput ? parseInt(ageInput.value) : null;
            if (!age || age < 8 || age > 100) {
                Utils.showToast('Введите корректный возраст (8-100 лет)', 'error');
                return;
            }

            // Сохранение информации о пользователе
            let userName = document.getElementById('user-name')?.value?.trim() || '';
            if (!userName) {
                // Пытаемся взять из настроек
                if (typeof Storage !== 'undefined') {
                    const settings = Storage.getSettings();
                    userName = settings.defaultName || 'Пользователь';
                } else {
                    userName = 'Пользователь';
                }
            } else {
                // Сохраняем имя в настройки
                if (typeof Storage !== 'undefined') {
                    const settings = Storage.getSettings();
                    settings.defaultName = userName;
                    Storage.saveSettings(settings);
                }
            }
            window.currentUserInfo = { age, name: userName };

            const difficulty = activeDifficulty.dataset.difficulty;
            const testMode = (typeof TestModes !== 'undefined') ? TestModes.currentMode : 'standard';
            const testParams = (typeof TestModes !== 'undefined') ? TestModes.getTestParams(difficulty) : null;
            if (typeof TestModes !== 'undefined') TestModes.updateSelectedCategories();

            console.log('Инициализация теста с сложностью:', difficulty, 'режим:', testMode);
            
            if (typeof TestEngine === 'undefined') {
                console.error('Ошибка: TestEngine не определен!');
                Utils.showToast('Ошибка загрузки модулей теста', 'error');
                return;
            }
            
            try {
                TestEngine.init(difficulty, testMode, testParams);
                console.log('Тест инициализирован, вопросов:', TestEngine.questions ? TestEngine.questions.length : 0);
                
                if (!TestEngine.questions || TestEngine.questions.length === 0) {
                    Utils.showToast('Ошибка: вопросы не загружены', 'error');
                    return;
                }
                
                loadTestPage();
                Utils.showPage('test-page');
            } catch (error) {
                console.error('Ошибка при инициализации теста:', error);
                Utils.showToast('Ошибка при запуске теста: ' + (error.message || 'Неизвестная ошибка'), 'error');
            }
        });
    } else {
        console.error('Кнопка start-test-btn не найдена в DOM!');
    }

    // Переключение темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            try {
                localStorage.setItem('theme', newTheme);
            } catch (error) {
                console.error('Ошибка сохранения темы:', error);
            }
            this.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }

    // Переключение звука
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    if (soundToggle && soundIcon) {
        if (typeof Sounds !== 'undefined') {
            // Устанавливаем начальное состояние
            soundIcon.textContent = Sounds.enabled ? '🔊' : '🔇';
            
            soundToggle.addEventListener('click', function() {
                try {
                    const enabled = Sounds.toggle();
                    soundIcon.textContent = enabled ? '🔊' : '🔇';
                    if (enabled) {
                        Sounds.playClick();
                    }
                } catch (error) {
                    console.error('Ошибка при переключении звука:', error);
                }
            });
        } else {
            // Если модуль Sounds не загружен, скрываем кнопку
            soundToggle.style.display = 'none';
        }
    }

    // Кнопки навигации в тесте
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const finishBtn = document.getElementById('finish-btn');

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            Sounds.playClick();
            if (TestEngine.currentQuestionIndex < TestEngine.questions.length - 1) {
                TestEngine.nextQuestion();
                loadQuestion();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            Sounds.playClick();
            if (TestEngine.currentQuestionIndex > 0) {
                TestEngine.prevQuestion();
                loadQuestion();
            }
        });
    }

    if (finishBtn) {
        finishBtn.addEventListener('click', function() {
            Sounds.playClick();
            finishTest();
        });
    }

    // Кнопка списка вопросов
    const questionListBtn = document.getElementById('question-list-btn');
    const questionModal = document.getElementById('question-list-modal');
    
    if (questionListBtn && questionModal) {
        questionListBtn.addEventListener('click', function() {
            if (typeof Sounds !== 'undefined') Sounds.playClick();
            showQuestionList();
            questionModal.classList.add('active');
        });
    }

    if (questionModal) {
        const modalClose = questionModal.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                questionModal.classList.remove('active');
            });
        }
        
        questionModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }

    // Кнопки результатов
    const saveResultsBtn = document.getElementById('save-results-btn');
    const exportResultsBtn = document.getElementById('export-results-btn');
    const shareResultsBtn = document.getElementById('share-results-btn');
    const restartTestBtn = document.getElementById('restart-test-btn');
    const showAnalysisBtn = document.getElementById('show-analysis-btn');

    if (saveResultsBtn) {
        saveResultsBtn.addEventListener('click', function() {
            Sounds.playClick();
            const currentResults = window.currentTestResults;
            if (currentResults) {
                // Добавляем информацию о пользователе
                if (window.currentUserInfo) {
                    currentResults.userAge = window.currentUserInfo.age;
                    currentResults.userName = window.currentUserInfo.name;
                }
                Storage.saveResult(currentResults);
                Sounds.playSuccess();
                Utils.showToast('Результат сохранен!', 'success');
                loadHistory();
                // Проверка достижений
                const newAchievements = Achievements.checkAchievements(currentResults);
                if (newAchievements.length > 0) {
                    newAchievements.forEach(achievement => {
                        Sounds.playAchievement();
                        Utils.showToast(`🏆 Достижение разблокировано: ${achievement.name}`, 'success');
                    });
                }
            }
        });
    }

    if (exportResultsBtn) {
        exportResultsBtn.addEventListener('click', function() {
            Sounds.playClick();
            const currentResults = window.currentTestResults;
            if (currentResults) {
                Export.exportToPDF(currentResults);
            }
        });
    }

    if (shareResultsBtn) {
        shareResultsBtn.addEventListener('click', function() {
            Sounds.playClick();
            const currentResults = window.currentTestResults;
            if (currentResults) {
                Export.shareResult(currentResults);
            }
        });
    }

    if (showAnalysisBtn) {
        showAnalysisBtn.addEventListener('click', function() {
            if (typeof Sounds !== 'undefined') Sounds.playClick();
            const analysisContent = document.getElementById('detailed-analysis-content');
            if (analysisContent) {
                const isVisible = !analysisContent.classList.contains('hidden');
                if (isVisible) {
                    analysisContent.classList.add('hidden');
                    this.textContent = 'Показать подробный анализ ответов';
                } else {
                    analysisContent.classList.remove('hidden');
                    this.textContent = 'Скрыть подробный анализ';
                    if (window.currentTestResults && typeof Analysis !== 'undefined') {
                        try {
                            const analysis = Analysis.generateDetailedAnalysis(window.currentTestResults);
                            displayDetailedAnalysis(analysis);
                        } catch (error) {
                            console.error('Ошибка при генерации анализа:', error);
                            analysisContent.innerHTML = '<p style="color: var(--text-secondary);">Ошибка загрузки анализа</p>';
                        }
                    }
                }
            }
        });
    }

    if (restartTestBtn) {
        restartTestBtn.addEventListener('click', function() {
            if (typeof Sounds !== 'undefined') Sounds.playClick();
            Utils.showPage('home-page');
        });
    }

    // История
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (typeof Sounds !== 'undefined') Sounds.playClick();
            if (confirm('Вы уверены, что хотите очистить всю историю?')) {
                if (typeof Storage !== 'undefined') {
                    Storage.clearResults();
                }
                loadHistory();
                if (typeof Statistics !== 'undefined') {
                    Statistics.init();
                }
                if (typeof Sounds !== 'undefined') Sounds.playSuccess();
                Utils.showToast('История очищена', 'success');
            }
        });
    }

    // Инициализация
    console.log('Инициализация завершена');
    console.log('Utils доступен:', typeof Utils !== 'undefined');
    console.log('TestEngine доступен:', typeof TestEngine !== 'undefined');
    console.log('Storage доступен:', typeof Storage !== 'undefined');
    
    try {
        // Инициализация модулей
        if (typeof Sounds !== 'undefined') {
            Sounds.init();
            console.log('Sounds модуль инициализирован');
        }
        
        // Инициализация режимов теста
        if (typeof TestModes !== 'undefined') {
            TestModes.init();
            console.log('TestModes модуль инициализирован');
        }
        
        loadHistory();
        
        if (typeof Statistics !== 'undefined') {
            Statistics.init();
        }
        
        console.log('Инициализация успешна!');
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
    
    // Проверка доступности всех модулей
    const modules = ['Utils', 'TestEngine', 'TestModes', 'Storage', 'AgeNorms', 'Achievements', 'Analysis', 'Export', 'ResultsDisplay', 'Statistics', 'Sounds', 'Leaderboard', 'Challenges', 'Certificates', 'Enhancements'];
    const missingModules = [];
    modules.forEach(moduleName => {
        if (typeof window[moduleName] === 'undefined') {
            console.warn(`Модуль ${moduleName} не загружен`);
            missingModules.push(moduleName);
        }
    });
    
    if (missingModules.length > 0) {
        console.warn('Не загружены модули:', missingModules.join(', '));
    } else {
        console.log('✅ Все модули загружены успешно!');
    }
});

// Загрузка страницы теста
function loadTestPage() {
    if (typeof TestEngine === 'undefined') {
        console.error('TestEngine не определен');
        Utils.showToast('Ошибка загрузки теста', 'error');
        return;
    }
    
    const question = TestEngine.getCurrentQuestion();
    if (!question) {
        console.warn('Вопрос не найден');
        Utils.showToast('Ошибка загрузки вопроса', 'error');
        return;
    }

    // Обновление информации о сложности
    const difficultyNames = {
        easy: 'Легкий',
        medium: 'Средний',
        hard: 'Сложный'
    };
    const difficultyBadge = document.getElementById('difficulty-badge');
    if (difficultyBadge) {
        difficultyBadge.textContent = difficultyNames[TestEngine.currentDifficulty] || TestEngine.currentDifficulty;
    }

    // Запуск таймера (только если не режим практики)
    if (TestEngine.testMode !== 'practice') {
        TestEngine.startTimer(function(timeLeft, isFinished) {
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = TestEngine.formatTime(timeLeft);
                if (timeLeft < 300) { // Меньше 5 минут
                    timerElement.style.color = '#ef4444';
                    if (timeLeft % 60 === 0 && timeLeft > 0 && typeof Sounds !== 'undefined') {
                        Sounds.playTick();
                    }
                } else {
                    timerElement.style.color = '';
                }
            }
            if (isFinished) {
                if (typeof Sounds !== 'undefined') Sounds.playComplete();
                finishTest();
            }
        });
    } else {
        // В режиме практики показываем бесконечное время
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = '∞';
            timerElement.style.color = '#10b981';
        }
    }

    loadQuestion();
}

// Загрузка вопроса
function loadQuestion() {
    if (typeof TestEngine === 'undefined') {
        console.error('TestEngine не определен');
        return;
    }
    
    const question = TestEngine.getCurrentQuestion();
    if (!question) {
        console.warn('Текущий вопрос не найден');
        return;
    }

    // Обновление прогресса
    let progress;
    try {
        progress = TestEngine.getProgress();
    } catch (error) {
        console.error('Ошибка при получении прогресса:', error);
        progress = { current: 1, total: 1, percentage: 0 };
    }
    
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.querySelector('.progress-text span');
    const questionNumber = document.getElementById('question-number');

    if (progressFill && progress) {
        progressFill.style.width = (progress.percentage || 0) + '%';
    }
    if (progressPercent && progress) {
        progressPercent.textContent = Math.round(progress.percentage || 0) + '%';
    }
    if (questionNumber && progress) {
        questionNumber.textContent = `${progress.current || 1} / ${progress.total || 1}`;
    }

    // Тип вопроса
    const typeNames = {
        sequence: 'Последовательность',
        math: 'Математика',
        logic: 'Логика',
        spatial: 'Пространственное',
        analogy: 'Аналогия',
        verbal: 'Вербальное',
        pattern: 'Паттерн'
    };
    const questionType = document.getElementById('question-type');
    if (questionType) {
        questionType.textContent = typeNames[question.type] || question.type;
    }

    // Вопрос
    const questionContent = document.getElementById('question-content');
    if (questionContent) {
        questionContent.textContent = question.question;
    }

    // Варианты ответов
    const answersContainer = document.getElementById('answers-container');
    if (answersContainer) {
        answersContainer.innerHTML = '';
        
        if (!question.answers || !Array.isArray(question.answers) || question.answers.length === 0) {
            answersContainer.innerHTML = '<p style="color: var(--text-secondary);">Варианты ответов недоступны</p>';
            return;
        }
        
        question.answers.forEach((answer, index) => {
            const option = document.createElement('div');
            option.className = 'answer-option';
            
            try {
                const currentAnswer = TestEngine.getAnswer(TestEngine.currentQuestionIndex);
                if (currentAnswer === index) {
                    option.classList.add('selected');
                }
            } catch (error) {
                console.error('Ошибка при получении ответа:', error);
            }

            const number = document.createElement('span');
            number.className = 'answer-number';
            number.textContent = index + 1;

            const text = document.createElement('span');
            text.textContent = answer || 'Вариант ' + (index + 1);

            option.appendChild(number);
            option.appendChild(text);

            option.addEventListener('click', function() {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                try {
                    TestEngine.saveAnswer(index);
                    document.querySelectorAll('.answer-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    updateQuestionList();
                } catch (error) {
                    console.error('Ошибка при сохранении ответа:', error);
                }
            });

            answersContainer.appendChild(option);
        });
    }

    // Кнопки навигации
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');

    if (prevBtn && typeof TestEngine !== 'undefined') {
        prevBtn.disabled = TestEngine.currentQuestionIndex === 0;
    }

    if (nextBtn && finishBtn && typeof TestEngine !== 'undefined' && TestEngine.questions) {
        const isLast = TestEngine.currentQuestionIndex === TestEngine.questions.length - 1;
        if (isLast) {
            nextBtn.classList.add('hidden');
            finishBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            finishBtn.classList.add('hidden');
        }
    }

    updateQuestionList();
}

// Обновление списка вопросов
function updateQuestionList() {
    const grid = document.getElementById('question-grid');
    if (!grid) return;

    if (typeof TestEngine === 'undefined' || !TestEngine.questions) {
        grid.innerHTML = '<p style="color: var(--text-secondary);">Вопросы не загружены</p>';
        return;
    }

    grid.innerHTML = '';
    TestEngine.questions.forEach((question, index) => {
        const item = document.createElement('div');
        item.className = 'question-grid-item';
        if (TestEngine.isAnswered(index)) {
            item.classList.add('answered');
        }
        if (index === TestEngine.currentQuestionIndex) {
            item.classList.add('current');
        }
        item.textContent = index + 1;
        item.addEventListener('click', function() {
            if (typeof Sounds !== 'undefined') Sounds.playClick();
            TestEngine.goToQuestion(index);
            loadQuestion();
            const modal = document.getElementById('question-list-modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
        grid.appendChild(item);
    });
}

// Показ списка вопросов
function showQuestionList() {
    if (typeof TestEngine === 'undefined' || TestEngine.questions.length === 0) {
        Utils.showToast('Вопросы не загружены', 'info');
        return;
    }
    updateQuestionList();
}

// Завершение теста
function finishTest() {
    if (typeof TestEngine === 'undefined') {
        console.error('TestEngine не определен');
        return;
    }
    
    TestEngine.stopTimer();
    let results;
    
    try {
        results = TestEngine.calculateResults();
    } catch (error) {
        console.error('Ошибка при расчете результатов:', error);
        Utils.showToast('Ошибка при расчете результатов', 'error');
        return;
    }
    
    if (!results) {
        console.error('Результаты не получены');
        return;
    }
    
    // Добавляем информацию о пользователе
    if (window.currentUserInfo) {
        results.userAge = window.currentUserInfo.age;
        results.userName = window.currentUserInfo.name;
        
        // Сравнение с возрастной нормой
        if (results.userAge && typeof AgeNorms !== 'undefined') {
            try {
                results.ageComparison = AgeNorms.compareWithAge(results.iq, results.userAge);
                results.ageGroupStats = AgeNorms.getAgeGroupStats(results.userAge);
            } catch (error) {
                console.error('Ошибка при сравнении с возрастной нормой:', error);
            }
        }
    }
    
    // Анализ сильных и слабых сторон
    if (typeof Analysis !== 'undefined' && results.categoryBreakdown) {
        try {
            const swAnalysis = Analysis.analyzeStrengthsWeaknesses(results.categoryBreakdown);
            results.strengths = swAnalysis.strengths;
            results.weaknesses = swAnalysis.weaknesses;
        } catch (error) {
            console.error('Ошибка при анализе сильных/слабых сторон:', error);
        }
    }
    
    // Генерация рекомендаций
    if (typeof Analysis !== 'undefined') {
        try {
            results.recommendations = Analysis.generateRecommendations(results);
        } catch (error) {
            console.error('Ошибка при генерации рекомендаций:', error);
            results.recommendations = [];
        }
    }
    
    // Сравнение с другими
    if (results.userAge && typeof Analysis !== 'undefined') {
        try {
            results.comparison = Analysis.compareWithOthers(results.iq, results.userAge);
        } catch (error) {
            console.error('Ошибка при сравнении с другими:', error);
        }
    }
    
    window.currentTestResults = results;
    
    // Автоматическое сохранение результатов
    try {
        // Убеждаемся, что имя пользователя сохранено
        if (!results.userName || results.userName === 'Пользователь') {
            if (window.currentUserInfo && window.currentUserInfo.name) {
                results.userName = window.currentUserInfo.name;
            } else if (typeof Storage !== 'undefined') {
                const settings = Storage.getSettings();
                if (settings.defaultName && String(settings.defaultName).trim()) {
                    results.userName = String(settings.defaultName).trim();
                } else {
                    results.userName = 'Пользователь';
                }
            }
        }
        
        // Сохраняем результат в Local Storage
        if (typeof Storage !== 'undefined') {
            Storage.saveResult(results);
            console.log('Результат автоматически сохранен:', results);
            
            // Обновляем историю и рейтинг
            setTimeout(() => {
                loadHistory();
                if (typeof Leaderboard !== 'undefined') {
                    Leaderboard.displayLeaderboard();
                }
                if (typeof Statistics !== 'undefined') {
                    Statistics.init();
                }
            }, 500);
        }
    } catch (error) {
        console.error('Ошибка при автоматическом сохранении результата:', error);
    }
    
    // Эффект конфетти при хорошем результате
    if (results.iq >= 120 && typeof window.showConfetti === 'function') {
        setTimeout(() => {
            try {
                window.showConfetti();
            } catch (error) {
                console.error('Ошибка при показе конфетти:', error);
            }
        }, 500);
    }
    
    // Анимация результатов
    Utils.showPage('results-page');
    setTimeout(() => {
        try {
            if (typeof ResultsDisplay !== 'undefined') {
                ResultsDisplay.showResults(results);
            }
            displayStrengthsWeaknesses(results);
            displayAgeComparison(results);
            displayRecommendations(results);
            displayAchievements(results);
            
            // Анимация чисел IQ
            const iqElement = document.getElementById('iq-score');
            if (iqElement) {
                if (typeof Enhancements !== 'undefined' && Enhancements.animateNumber && results.iq) {
                    const targetIQ = results.iq;
                    iqElement.textContent = '0';
                    Enhancements.animateNumber(iqElement, targetIQ, 2000);
                } else {
                    iqElement.textContent = results.iq || 0;
                }
            }
        } catch (error) {
            console.error('Ошибка при отображении результатов:', error);
            Utils.showToast('Ошибка при отображении результатов', 'error');
        }
    }, 300);
    
    // Проверка достижений
    if (typeof Achievements !== 'undefined') {
        try {
            const newAchievements = Achievements.checkAchievements(results);
            if (newAchievements && newAchievements.length > 0) {
                setTimeout(() => {
                    newAchievements.forEach((achievement, index) => {
                        setTimeout(() => {
                            if (typeof Sounds !== 'undefined') Sounds.playAchievement();
                            Utils.showToast(`🏆 Достижение: ${achievement.name || 'Новое достижение'}`, 'success');
                        }, index * 500);
                    });
                }, 1000);
            }
        } catch (error) {
            console.error('Ошибка при проверке достижений:', error);
        }
    }

    // Проверка заданий
    if (typeof Challenges !== 'undefined') {
        try {
            const completedChallenges = Challenges.checkChallenges(results);
            Challenges.claimPermanentIfNeeded();
            if (completedChallenges && completedChallenges.length > 0) {
                setTimeout(() => {
                    completedChallenges.forEach((challenge, index) => {
                        setTimeout(() => {
                            if (typeof Sounds !== 'undefined') Sounds.playSuccess();
                            Utils.showToast(`🎯 Задание выполнено: ${challenge.name || 'Новое задание'}`, 'success');
                        }, (newAchievements ? newAchievements.length * 500 : 0) + (index * 500));
                    });
                }, 3000);
            }
        } catch (error) {
            console.error('Ошибка при проверке заданий:', error);
        }
    }
}

// Загрузка истории
function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (typeof Storage === 'undefined') {
        historyList.innerHTML = '<p style="color: var(--text-secondary);">Модуль Storage недоступен</p>';
        return;
    }

    let results;
    try {
        results = Storage.getResults();
    } catch (error) {
        console.error('Ошибка при загрузке истории:', error);
        historyList.innerHTML = '<p style="color: var(--text-secondary);">Ошибка загрузки истории</p>';
        return;
    }
    
    if (!results || results.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h2>История пуста</h2>
                <p>Пройдите тест, чтобы увидеть результаты здесь</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = '';
    results.reverse().forEach(result => {
        if (!result) return;
        
        const item = document.createElement('div');
        item.className = 'history-item';
        
        let date = 'Дата неизвестна';
        try {
            date = new Date(result.timestamp).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
        }

        const difficultyNames = {
            easy: 'Легкий',
            medium: 'Средний',
            hard: 'Сложный'
        };
        const difficultyName = difficultyNames[result.difficulty] || result.difficulty || 'Неизвестно';

        item.innerHTML = `
            <div class="history-info">
                <div class="history-date">${date}</div>
                <div class="history-iq">IQ: ${result.iq || 0}</div>
                <div class="history-details">
                    <span>Правильно: ${result.correctAnswers || 0}/${result.totalQuestions || 0}</span>
                    <span>Сложность: ${difficultyName}</span>
                </div>
            </div>
            <button type="button" class="btn btn-danger" onclick="deleteResult(${result.id || 0})">Удалить</button>
        `;

        historyList.appendChild(item);
    });
}

// Удаление результата
function deleteResult(id) {
    if (typeof Sounds !== 'undefined') Sounds.playClick();
    if (confirm('Удалить этот результат?')) {
        if (typeof Storage !== 'undefined') {
            try {
                Storage.deleteResult(id);
                loadHistory();
                // Обновляем рейтинг и статистику
                if (typeof Leaderboard !== 'undefined') {
                    Leaderboard.displayLeaderboard();
                }
                if (typeof Statistics !== 'undefined') {
                    Statistics.init();
                }
                if (typeof Sounds !== 'undefined') Sounds.playSuccess();
                Utils.showToast('Результат удален', 'success');
            } catch (error) {
                console.error('Ошибка при удалении результата:', error);
                Utils.showToast('Ошибка при удалении результата', 'error');
            }
        }
    }
}

// Отображение сильных и слабых сторон
function displayStrengthsWeaknesses(results) {
    if (!results) return;
    
    const strengthsList = document.getElementById('strengths-list');
    const weaknessesList = document.getElementById('weaknesses-list');
    
    if (strengthsList && results.strengths) {
        if (!results.strengths || results.strengths.length === 0) {
            strengthsList.innerHTML = '<p style="color: var(--text-secondary);">Нет явных сильных сторон</p>';
        } else {
            strengthsList.innerHTML = results.strengths.map(item => `
                <div class="sw-item">
                    <span>${item.category || 'Неизвестно'}</span>
                    <strong style="color: var(--success-color);">${item.score || 0}%</strong>
                </div>
            `).join('');
        }
    }
    
    if (weaknessesList && results.weaknesses) {
        if (!results.weaknesses || results.weaknesses.length === 0) {
            weaknessesList.innerHTML = '<p style="color: var(--text-secondary);">Нет явных слабых сторон</p>';
        } else {
            weaknessesList.innerHTML = results.weaknesses.map(item => `
                <div class="sw-item">
                    <span>${item.category || 'Неизвестно'}</span>
                    <strong style="color: var(--warning-color);">${item.score || 0}%</strong>
                </div>
            `).join('');
        }
    }
}

// Отображение сравнения с возрастной группой
function displayAgeComparison(results) {
    if (!results) return;
    
    const container = document.getElementById('age-comparison-content');
    if (!container) return;
    
    if (!results.ageComparison) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Информация о возрастном сравнении недоступна</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="comparison-item">
            <h3 style="margin-bottom: 0.5rem;">Ваш IQ: ${results.iq || 0}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                ${results.ageComparison.comparison || 'Сравнение недоступно'}
            </p>
            <p style="font-size: 0.9em; color: var(--text-secondary);">
                Средний IQ для вашей возрастной группы: ${results.ageComparison.groupAverage || 100}
                ${results.ageComparison.difference !== undefined ? (results.ageComparison.difference > 0 ? `(+${results.ageComparison.difference})` : `(${results.ageComparison.difference})`) : ''}
            </p>
        </div>
        ${results.ageGroupStats ? `
            <div class="comparison-item" style="margin-top: 1rem;">
                <h4 style="margin-bottom: 0.5rem;">${results.ageGroupStats.name || 'Возрастная группа'}</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${results.ageGroupStats.description || ''}</p>
                ${results.ageGroupStats.tips && results.ageGroupStats.tips.length > 0 ? `
                    <div>
                        <strong>Советы для улучшения:</strong>
                        <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                            ${results.ageGroupStats.tips.map(tip => `<li style="margin-bottom: 0.25rem;">${tip}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        ` : ''}
    `;
}

// Отображение рекомендаций
function displayRecommendations(results) {
    if (!results) return;
    
    const container = document.getElementById('recommendations-list');
    if (!container) return;
    
    if (!results.recommendations || results.recommendations.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Рекомендации отсутствуют</p>';
        return;
    }
    
    container.innerHTML = results.recommendations.map(rec => `
        <div class="recommendation-item ${rec.priority || 'medium'}">
            <div class="recommendation-title">${rec.title || 'Рекомендация'}</div>
            <div class="recommendation-description">${rec.description || ''}</div>
        </div>
    `).join('');
}

// Отображение достижений
function displayAchievements(results) {
    if (!results) return;
    
    const container = document.getElementById('achievements-display');
    if (!container) return;
    
    if (typeof Achievements === 'undefined') {
        container.innerHTML = '<p style="color: var(--text-secondary);">Достижения недоступны</p>';
        return;
    }
    
    try {
        const unlocked = Achievements.checkAchievements(results);
        const allAchievements = Achievements.getAchievementsForDisplay();
        const relevantAchievements = allAchievements.filter(a => {
            try {
                return a.condition && a.condition.length === 1 && (a.category === 'performance' || a.category === 'category' || a.category === 'difficulty');
            } catch (e) {
                return false;
            }
        });
        
        if (relevantAchievements.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Нет достижений для отображения</p>';
            return;
        }
        
        container.innerHTML = relevantAchievements.slice(0, 6).map(achievement => `
            <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}" title="${achievement.description || ''}">
                <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                <div class="achievement-name">${achievement.name || 'Достижение'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка при отображении достижений:', error);
        container.innerHTML = '<p style="color: var(--text-secondary);">Ошибка загрузки достижений</p>';
    }
}

// Отображение детального анализа
function displayDetailedAnalysis(analysis) {
    if (!analysis || !Array.isArray(analysis)) return;
    
    const container = document.getElementById('detailed-analysis-content');
    if (!container) return;
    
    if (analysis.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Анализ недоступен</p>';
        return;
    }
    
    container.innerHTML = analysis.map(item => `
        <div class="analysis-item ${item.isCorrect ? 'correct' : 'incorrect'}">
            <div class="analysis-question">
                Вопрос ${item.questionNumber || '?'}: ${item.question || 'Вопрос недоступен'}
            </div>
            <div class="analysis-answers">
                <div class="answer-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <strong>Ваш ответ:</strong> ${item.userAnswer !== undefined && item.userAnswer !== null ? item.userAnswer : 'Не отвечено'}
                </div>
                ${!item.isCorrect ? `
                    <div class="answer-item correct">
                        <strong>Правильный ответ:</strong> ${item.correctAnswer || 'Неизвестно'}
                    </div>
                ` : ''}
            </div>
            <div class="analysis-explanation">
                <strong>Объяснение:</strong> ${item.explanation || 'Объяснение отсутствует'}
            </div>
        </div>
    `).join('');
}

// Загрузка страницы достижений
function loadAchievementsPage() {
    if (typeof Achievements === 'undefined') {
        const container = document.getElementById('achievements-list');
        if (container) container.innerHTML = '<p style="color: var(--text-secondary);">Достижения недоступны</p>';
        return;
    }
    try {
        Achievements.init();
    } catch (error) {
        console.error('Ошибка при загрузке достижений:', error);
        const container = document.getElementById('achievements-list');
        if (container) container.innerHTML = '<p style="color: var(--text-secondary);">Ошибка загрузки достижений</p>';
    }
}

// Обновление статистики при переходе на страницу
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-page="statistics"]')) {
        setTimeout(() => {
            if (typeof Statistics !== 'undefined') {
                try {
                    Statistics.init();
                } catch (error) {
                    console.error('Ошибка при инициализации статистики:', error);
                }
            }
        }, 100);
    }
    if (e.target.closest('[data-page="achievements"]')) {
        setTimeout(() => {
            try {
                loadAchievementsPage();
            } catch (error) {
                console.error('Ошибка при загрузке достижений:', error);
            }
        }, 100);
    }
    if (e.target.closest('[data-page="leaderboard"]')) {
        setTimeout(() => {
            if (typeof Leaderboard !== 'undefined') Leaderboard.init();
        }, 100);
    }
    if (e.target.closest('[data-page="challenges"]')) {
        setTimeout(() => {
            if (typeof Challenges !== 'undefined') Challenges.init();
        }, 100);
    }
    if (e.target.closest('[data-page="history"]')) {
        setTimeout(() => {
            if (typeof loadHistory === 'function') {
                loadHistory();
            }
        }, 100);
    }
});

// Сохранение имени пользователя в настройки при вводе
document.addEventListener('DOMContentLoaded', function() {
    const userNameInput = document.getElementById('user-name');
    if (userNameInput) {
        // Загружаем сохраненное имя при загрузке страницы
        if (typeof Storage !== 'undefined') {
            const settings = Storage.getSettings();
            if (settings.defaultName) {
                userNameInput.value = settings.defaultName;
            }
        }
        
        // Сохраняем имя при изменении (с задержкой)
        let saveTimeout;
        userNameInput.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                if (typeof Storage !== 'undefined' && this.value.trim()) {
                    const settings = Storage.getSettings();
                    settings.defaultName = this.value.trim();
                    Storage.saveSettings(settings);
                    console.log('Имя пользователя сохранено:', this.value.trim());
                }
            }, 1000);
        });
    }
});

