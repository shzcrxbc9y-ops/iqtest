// Модуль для отображения результатов

const ResultsDisplay = {
    // Отображение результатов
    showResults(results) {
        // Обновление даты
        const dateElement = document.getElementById('results-date');
        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Отображение IQ
        const iqScoreElement = document.getElementById('iq-score');
        if (iqScoreElement) {
            iqScoreElement.textContent = results.iq;
        }

        // Анимация кольца прогресса
        const progressRing = document.getElementById('iq-ring-progress');
        if (progressRing) {
            const circumference = 2 * Math.PI * 90;
            const targetOffset = circumference - (results.iq / 160) * circumference;
            progressRing.style.strokeDashoffset = circumference; // Начальное значение
            
            // Анимация с задержкой
            setTimeout(() => {
                progressRing.style.strokeDashoffset = targetOffset;
            }, 300);
        }

        // Уровень IQ
        const levelElement = document.getElementById('iq-level-text');
        const levelTitleElement = document.getElementById('iq-level-title');
        if (levelElement) {
            levelElement.textContent = results.level;
        }
        if (levelTitleElement) {
            levelTitleElement.textContent = results.level;
        }

        // Описание
        const descriptionElement = document.getElementById('iq-description');
        if (descriptionElement) {
            descriptionElement.textContent = results.description;
        }

        // Процентиль
        const percentileElement = document.getElementById('iq-percentile');
        if (percentileElement) {
            percentileElement.textContent = results.percentile + '%';
        }

        // Статистика
        const correctAnswersEl = document.getElementById('correct-answers');
        const totalQuestionsEl = document.getElementById('total-questions-result');
        const percentageEl = document.getElementById('percentage');
        const timeSpentEl = document.getElementById('time-spent');
        const averageScoreEl = document.getElementById('average-score');
        
        if (correctAnswersEl) correctAnswersEl.textContent = results.correctAnswers;
        if (totalQuestionsEl) totalQuestionsEl.textContent = results.totalQuestions;
        if (percentageEl) percentageEl.textContent = results.percentage + '%';
        
        if (timeSpentEl && results.timeSpent !== undefined) {
            const timeSpent = TestEngine.formatTime(results.timeSpent);
            timeSpentEl.textContent = timeSpent;
        }

        // Средний балл по категориям
        if (averageScoreEl && results.categoryBreakdown) {
            const categories = Object.keys(results.categoryBreakdown);
            if (categories.length > 0) {
                const avgScore = Object.values(results.categoryBreakdown).reduce((a, b) => a + b, 0) / categories.length;
                averageScoreEl.textContent = Math.round(avgScore) + '%';
            }
        }

        // Отображение результатов по категориям
        if (results.categoryBreakdown) {
            this.showCategoryBreakdown(results.categoryBreakdown);
        }
        
        // Режим теста (Стандартный / Практика / Быстрый)
        const testModeEl = document.getElementById('results-test-mode');
        if (testModeEl) {
            testModeEl.textContent = results.testModeName ? `Режим: ${results.testModeName}` : '';
        }

        // Обновление имени пользователя если есть
        if (results.userName && results.userName !== 'Пользователь') {
            const resultsHeader = document.querySelector('.results-header h1');
            if (resultsHeader) {
                resultsHeader.textContent = `Результаты теста ${results.userName}`;
            }
        }
    },

    // Отображение результатов по категориям
    showCategoryBreakdown(categoryBreakdown) {
        const container = document.getElementById('category-stats');
        if (!container) return;

        if (!categoryBreakdown || typeof categoryBreakdown !== 'object') {
            container.innerHTML = '<p style="color: var(--text-secondary);">Данные по категориям недоступны</p>';
            return;
        }

        container.innerHTML = '';

        const categoryNames = {
            'Логика': '🧠',
            'Математика': '🔢',
            'Пространственное': '📐',
            'Вербальные': '📝',
            'Аналогии': '🔗',
            'Паттерны': '🔍'
        };

        const categories = Object.keys(categoryBreakdown);
        if (categories.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Нет данных по категориям</p>';
            return;
        }

        categories.forEach(category => {
            const score = categoryBreakdown[category];
            if (score === undefined || score === null) return;
            
            const icon = categoryNames[category] || '📊';

            const item = document.createElement('div');
            item.className = 'category-item';

            item.innerHTML = `
                <div class="category-header">
                    <span class="category-name">${icon} ${category || 'Неизвестная категория'}</span>
                    <span class="category-score">${Math.round(score)}%</span>
                </div>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${Math.min(Math.max(score, 0), 100)}%"></div>
                </div>
            `;

            container.appendChild(item);
        });
    }
};
