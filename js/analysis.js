// Модуль для детального анализа результатов

const Analysis = {
    // Анализ сильных и слабых сторон
    analyzeStrengthsWeaknesses(categoryBreakdown) {
        const categories = Object.keys(categoryBreakdown);
        const scores = Object.values(categoryBreakdown);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        const strengths = [];
        const weaknesses = [];
        
        categories.forEach(category => {
            const score = categoryBreakdown[category];
            if (score >= average + 10) {
                strengths.push({
                    category,
                    score,
                    level: this.getPerformanceLevel(score)
                });
            } else if (score < average - 10) {
                weaknesses.push({
                    category,
                    score,
                    level: this.getPerformanceLevel(score)
                });
            }
        });

        // Сортировка
        strengths.sort((a, b) => b.score - a.score);
        weaknesses.sort((a, b) => a.score - b.score);

        return { strengths, weaknesses, average };
    },

    // Уровень производительности
    getPerformanceLevel(score) {
        if (score >= 90) return 'отличный';
        if (score >= 75) return 'хороший';
        if (score >= 60) return 'удовлетворительный';
        return 'требует улучшения';
    },

    // Генерация рекомендаций
    generateRecommendations(results) {
        const recommendations = [];
        const { strengths, weaknesses } = this.analyzeStrengthsWeaknesses(results.categoryBreakdown);
        
        // Рекомендации на основе слабых сторон
        weaknesses.forEach(weakness => {
            const recs = this.getCategoryRecommendations(weakness.category, weakness.score);
            recommendations.push(...recs);
        });

        // Общие рекомендации
        if (results.iq < 100) {
            recommendations.push({
                title: 'Регулярная практика',
                description: 'Регулярно проходите тесты IQ для улучшения результатов. Практика помогает развивать интеллектуальные способности.',
                priority: 'high'
            });
        }

        if (results.percentage < 70) {
            recommendations.push({
                title: 'Изучение основ',
                description: 'Рекомендуется изучить основы логики, математики и пространственного мышления для улучшения результатов.',
                priority: 'high'
            });
        }

        // Рекомендации на основе времени
        const timeLimit = results.difficulty === 'easy' ? 1800 : results.difficulty === 'medium' ? 2400 : 2700;
        if (results.timeSpent > timeLimit * 0.9) {
            recommendations.push({
                title: 'Работа над скоростью',
                description: 'Попробуйте решать задачи быстрее. Тренируйтесь на логических задачах и головоломках.',
                priority: 'medium'
            });
        }

        return recommendations;
    },

    // Рекомендации по категориям
    getCategoryRecommendations(category, score) {
        const recommendations = [];
        
        const categoryTips = {
            'Математика': [
                {
                    title: 'Практика математических задач',
                    description: 'Решайте математические задачи разной сложности. Изучайте проценты, дроби, алгебру.',
                    priority: 'high'
                },
                {
                    title: 'Математические игры',
                    description: 'Играйте в математические игры и головоломки для развития навыков.',
                    priority: 'medium'
                }
            ],
            'Логика': [
                {
                    title: 'Логические задачи',
                    description: 'Решайте логические задачи и головоломки. Изучайте основы логики.',
                    priority: 'high'
                },
                {
                    title: 'Шахматы и стратегические игры',
                    description: 'Играйте в шахматы и другие стратегические игры для развития логического мышления.',
                    priority: 'medium'
                }
            ],
            'Пространственное': [
                {
                    title: 'Пространственные задачи',
                    description: 'Решайте задачи на пространственное мышление. Работайте с геометрическими фигурами.',
                    priority: 'high'
                },
                {
                    title: '3D моделирование',
                    description: 'Попробуйте 3D моделирование или конструкторы для развития пространственного мышления.',
                    priority: 'medium'
                }
            ],
            'Вербальные': [
                {
                    title: 'Чтение и словарный запас',
                    description: 'Читайте больше книг, изучайте новые слова. Развивайте вербальные навыки.',
                    priority: 'high'
                },
                {
                    title: 'Изучение языков',
                    description: 'Изучайте иностранные языки для развития вербальных способностей.',
                    priority: 'medium'
                }
            ],
            'Аналогии': [
                {
                    title: 'Работа с аналогиями',
                    description: 'Практикуйтесь в решении задач на аналогии. Изучайте связи между понятиями.',
                    priority: 'high'
                }
            ],
            'Паттерны': [
                {
                    title: 'Распознавание паттернов',
                    description: 'Тренируйтесь в распознавании паттернов. Решайте задачи на последовательности.',
                    priority: 'high'
                }
            ]
        };

        if (categoryTips[category]) {
            return categoryTips[category];
        }

        return [];
    },

    // Сравнение с другими пользователями (симуляция)
    compareWithOthers(iq, age) {
        // Симуляция статистики других пользователей
        const ageGroup = AgeNorms.getAgeGroup(age);
        
        const stats = {
            'child': { average: 100, top10: 120, top25: 110 },
            'teen': { average: 100, top10: 120, top25: 110 },
            'adult': { average: 100, top10: 120, top25: 110 },
            'senior': { average: 100, top10: 120, top25: 110 }
        };

        const groupStats = stats[ageGroup];
        let comparison = '';
        let percentile = 50;

        if (iq >= groupStats.top10) {
            comparison = 'Вы входите в топ 10% пользователей вашей возрастной группы';
            percentile = 90;
        } else if (iq >= groupStats.top25) {
            comparison = 'Вы входите в топ 25% пользователей вашей возрастной группы';
            percentile = 75;
        } else if (iq >= groupStats.average) {
            comparison = 'Ваш результат выше среднего для вашей возрастной группы';
            percentile = 60;
        } else {
            comparison = 'Ваш результат соответствует среднему уровню';
            percentile = 50;
        }

        return {
            comparison,
            percentile,
            groupAverage: groupStats.average,
            userIQ: iq,
            difference: iq - groupStats.average
        };
    },

    // Детальный анализ ответов
    generateDetailedAnalysis(results) {
        const analysis = [];
        
        results.answers.forEach((answerData, index) => {
            const question = answerData.question;
            const isCorrect = answerData.isCorrect;
            
            analysis.push({
                questionNumber: index + 1,
                question: question.question,
                category: question.category,
                type: question.type,
                userAnswer: question.answers[answerData.userAnswer],
                correctAnswer: question.answers[question.correct],
                isCorrect,
                explanation: question.explanation || 'Объяснение отсутствует'
            });
        });

        return analysis;
    }
};
