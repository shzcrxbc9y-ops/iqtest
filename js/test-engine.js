// Движок теста IQ

const TestEngine = {
    currentDifficulty: 'medium',
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: null,
    timeLimit: 2700, // 45 минут в секундах
    timerInterval: null,
    timeLeft: 2700,

    // Инициализация теста (поддержка режимов: standard, practice, quick)
    init(difficulty = 'medium', mode = 'standard', params = null) {
        this.currentDifficulty = difficulty;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = Date.now();
        this.testMode = mode || 'standard';

        let count, timeLimit;
        if (params && params.count !== undefined) {
            count = params.count;
            timeLimit = params.timeLimit !== undefined ? params.timeLimit : (mode === 'practice' ? null : 2700);
        } else {
            const questionCounts = { easy: 20, medium: 35, hard: 50 };
            const timeLimits = { easy: 1800, medium: 2400, hard: 2700 };
            count = questionCounts[difficulty] || 35;
            timeLimit = timeLimits[difficulty] || 2700;
        }

        this.timeLimit = timeLimit;
        this.timeLeft = timeLimit || 0;

        let questions;
        if (typeof TestModes !== 'undefined' && TestModes.selectedCategories && TestModes.selectedCategories.length > 0) {
            const pool = getRandomQuestions(difficulty, Math.max(count * 3, 60));
            questions = TestModes.filterQuestionsByCategory(pool).slice(0, count);
            if (questions.length < count) {
                const extra = getRandomQuestions(difficulty, count - questions.length);
                questions = [...questions, ...extra].slice(0, count);
            }
        } else {
            questions = getRandomQuestions(difficulty, count);
        }
        this.questions = questions;
        this.answers = new Array(this.questions.length).fill(null);

        return {
            questions: this.questions,
            totalQuestions: this.questions.length,
            timeLimit: this.timeLimit
        };
    },

    // Получение текущего вопроса
    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            return null;
        }
        return this.questions[this.currentQuestionIndex];
    },

    // Сохранение ответа
    saveAnswer(answerIndex) {
        if (this.currentQuestionIndex < this.questions.length) {
            this.answers[this.currentQuestionIndex] = answerIndex;
        }
    },

    // Переход к следующему вопросу
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    },

    // Переход к предыдущему вопросу
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    },

    // Переход к конкретному вопросу
    goToQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            this.currentQuestionIndex = index;
            return true;
        }
        return false;
    },

    // Получение ответа на вопрос
    getAnswer(index) {
        return this.answers[index];
    },

    // Проверка, отвечен ли вопрос
    isAnswered(index) {
        return this.answers[index] !== null;
    },

    // Подсчет результатов
    calculateResults() {
        let correctCount = 0;
        const categoryStats = {};
        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);

        this.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];
            const isCorrect = userAnswer === question.correct;

            if (isCorrect) {
                correctCount++;
            }

            // Статистика по категориям
            if (!categoryStats[question.category]) {
                categoryStats[question.category] = {
                    total: 0,
                    correct: 0
                };
            }
            categoryStats[question.category].total++;
            if (isCorrect) {
                categoryStats[question.category].correct++;
            }
        });

        // Вычисление процента правильных ответов
        const percentage = (correctCount / this.questions.length) * 100;

        // Вычисление IQ
        const mean = 50;
        const stdDev = 20;
        const zScore = (percentage - mean) / stdDev;
        let iq = Math.round(100 + (zScore * 15));
        iq = Math.max(70, Math.min(160, iq));

        // Процент по категориям
        const categoryBreakdown = {};
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category];
            categoryBreakdown[category] = Math.round((stats.correct / stats.total) * 100);
        });

        // Определение уровня IQ
        let level, description, percentile;
        if (iq >= 130) {
            level = 'Очень высокий интеллект';
            description = 'Вы обладаете выдающимися интеллектуальными способностями. Ваш IQ находится в верхних 2% населения.';
            percentile = 98;
        } else if (iq >= 120) {
            level = 'Высокий интеллект';
            description = 'У вас высокий уровень интеллекта. Вы находитесь в верхних 10% населения по интеллектуальным способностям.';
            percentile = 90;
        } else if (iq >= 110) {
            level = 'Выше среднего';
            description = 'Ваш интеллект выше среднего уровня. Вы обладаете хорошими аналитическими способностями.';
            percentile = 75;
        } else if (iq >= 90) {
            level = 'Средний интеллект';
            description = 'У вас средний уровень интеллекта, что соответствует большинству населения.';
            percentile = 50;
        } else if (iq >= 80) {
            level = 'Ниже среднего';
            description = 'Ваш интеллект немного ниже среднего уровня, но это нормальный диапазон.';
            percentile = 25;
        } else {
            level = 'Низкий интеллект';
            description = 'Ваш результат ниже среднего. Рекомендуется пройти тест повторно для подтверждения результата.';
            percentile = 10;
        }

        const modeNames = { standard: 'Стандартный', practice: 'Практика', quick: 'Быстрый' };
        return {
            iq,
            level,
            description,
            percentile,
            correctAnswers: correctCount,
            totalQuestions: this.questions.length,
            percentage: Math.round(percentage * 10) / 10,
            timeSpent,
            difficulty: this.currentDifficulty,
            testMode: this.testMode || 'standard',
            testModeName: modeNames[this.testMode] || 'Стандартный',
            categoryBreakdown,
            categoryStats: categoryStats,
            answers: this.answers.map((answer, index) => ({
                questionIndex: index,
                userAnswer: answer,
                correctAnswer: this.questions[index].correct,
                isCorrect: answer === this.questions[index].correct,
                question: this.questions[index]
            }))
        };
    },

    // Запуск таймера (в режиме практики не запускается)
    startTimer(callback) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.testMode === 'practice' || this.timeLimit == null) {
            if (callback) callback(0, false);
            return;
        }

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (callback) {
                callback(this.timeLeft, false);
            }
            if (this.timeLeft <= 0) {
                this.stopTimer();
                if (callback) callback(0, true);
            }
        }, 1000);
    },

    // Остановка таймера
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    // Форматирование времени
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Расчет процентиля
    calculatePercentile(iq) {
        // Стандартное нормальное распределение для IQ
        // Среднее = 100, стандартное отклонение = 15
        const mean = 100;
        const stdDev = 15;
        const z = (iq - mean) / stdDev;
        
        // Приближенный расчет процентиля
        // Используем упрощенную формулу для нормального распределения
        const percentile = 50 * (1 + this.erf(z / Math.sqrt(2))) * 100;
        return Math.round(Math.max(0, Math.min(100, percentile)));
    },

    // Функция ошибок для расчета процентиля
    erf(x) {
        // Приближение функции ошибок
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    },

    // Получение прогресса
    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.questions.length,
            percentage: ((this.currentQuestionIndex + 1) / this.questions.length) * 100,
            answered: this.answers.filter(a => a !== null).length
        };
    }
};
