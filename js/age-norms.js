// Модуль для определения IQ по возрасту

const AgeNorms = {
    // Возрастные нормы IQ (средние значения по возрастам)
    ageNorms: {
        8: { mean: 100, stdDev: 15, range: '85-115' },
        9: { mean: 100, stdDev: 15, range: '85-115' },
        10: { mean: 100, stdDev: 15, range: '85-115' },
        11: { mean: 100, stdDev: 15, range: '85-115' },
        12: { mean: 100, stdDev: 15, range: '85-115' },
        13: { mean: 100, stdDev: 15, range: '85-115' },
        14: { mean: 100, stdDev: 15, range: '85-115' },
        15: { mean: 100, stdDev: 15, range: '85-115' },
        16: { mean: 100, stdDev: 15, range: '85-115' },
        17: { mean: 100, stdDev: 15, range: '85-115' },
        18: { mean: 100, stdDev: 15, range: '85-115' },
        19: { mean: 100, stdDev: 15, range: '85-115' },
        20: { mean: 100, stdDev: 15, range: '85-115' },
        21: { mean: 100, stdDev: 15, range: '85-115' },
        22: { mean: 100, stdDev: 15, range: '85-115' },
        23: { mean: 100, stdDev: 15, range: '85-115' },
        24: { mean: 100, stdDev: 15, range: '85-115' },
        25: { mean: 100, stdDev: 15, range: '85-115' },
        26: { mean: 100, stdDev: 15, range: '85-115' },
        27: { mean: 100, stdDev: 15, range: '85-115' },
        28: { mean: 100, stdDev: 15, range: '85-115' },
        29: { mean: 100, stdDev: 15, range: '85-115' },
        30: { mean: 100, stdDev: 15, range: '85-115' },
        31: { mean: 100, stdDev: 15, range: '85-115' },
        32: { mean: 100, stdDev: 15, range: '85-115' },
        33: { mean: 100, stdDev: 15, range: '85-115' },
        34: { mean: 100, stdDev: 15, range: '85-115' },
        35: { mean: 100, stdDev: 15, range: '85-115' },
        36: { mean: 100, stdDev: 15, range: '85-115' },
        37: { mean: 100, stdDev: 15, range: '85-115' },
        38: { mean: 100, stdDev: 15, range: '85-115' },
        39: { mean: 100, stdDev: 15, range: '85-115' },
        40: { mean: 100, stdDev: 15, range: '85-115' },
        41: { mean: 100, stdDev: 15, range: '85-115' },
        42: { mean: 100, stdDev: 15, range: '85-115' },
        43: { mean: 100, stdDev: 15, range: '85-115' },
        44: { mean: 100, stdDev: 15, range: '85-115' },
        45: { mean: 100, stdDev: 15, range: '85-115' },
        46: { mean: 100, stdDev: 15, range: '85-115' },
        47: { mean: 100, stdDev: 15, range: '85-115' },
        48: { mean: 100, stdDev: 15, range: '85-115' },
        49: { mean: 100, stdDev: 15, range: '85-115' },
        50: { mean: 100, stdDev: 15, range: '85-115' },
        51: { mean: 100, stdDev: 15, range: '85-115' },
        52: { mean: 100, stdDev: 15, range: '85-115' },
        53: { mean: 100, stdDev: 15, range: '85-115' },
        54: { mean: 100, stdDev: 15, range: '85-115' },
        55: { mean: 100, stdDev: 15, range: '85-115' },
        56: { mean: 100, stdDev: 15, range: '85-115' },
        57: { mean: 100, stdDev: 15, range: '85-115' },
        58: { mean: 100, stdDev: 15, range: '85-115' },
        59: { mean: 100, stdDev: 15, range: '85-115' },
        60: { mean: 100, stdDev: 15, range: '85-115' },
        61: { mean: 100, stdDev: 15, range: '85-115' },
        62: { mean: 100, stdDev: 15, range: '85-115' },
        63: { mean: 100, stdDev: 15, range: '85-115' },
        64: { mean: 100, stdDev: 15, range: '85-115' },
        65: { mean: 100, stdDev: 15, range: '85-115' },
        66: { mean: 100, stdDev: 15, range: '85-115' },
        67: { mean: 100, stdDev: 15, range: '85-115' },
        68: { mean: 100, stdDev: 15, range: '85-115' },
        69: { mean: 100, stdDev: 15, range: '85-115' },
        70: { mean: 100, stdDev: 15, range: '85-115' }
    },

    // Получить норму для возраста
    getNorm(age) {
        if (age < 8) age = 8;
        if (age > 70) age = 70;
        return this.ageNorms[age] || this.ageNorms[25];
    },

    // Сравнить IQ с возрастной нормой
    compareWithAge(iq, age) {
        const norm = this.getNorm(age);
        const difference = iq - norm.mean;
        const zScore = difference / norm.stdDev;
        
        let comparison = '';
        let percentage = 0;
        
        if (zScore >= 2) {
            comparison = 'значительно выше среднего';
            percentage = 98;
        } else if (zScore >= 1) {
            comparison = 'выше среднего';
            percentage = 84;
        } else if (zScore >= 0) {
            comparison = 'на уровне среднего';
            percentage = 50;
        } else if (zScore >= -1) {
            comparison = 'ниже среднего';
            percentage = 16;
        } else {
            comparison = 'значительно ниже среднего';
            percentage = 2;
        }

        return {
            age,
            normMean: norm.mean,
            normRange: norm.range,
            userIQ: iq,
            difference,
            zScore: Math.round(zScore * 100) / 100,
            comparison,
            percentage,
            interpretation: this.getAgeInterpretation(age, iq, norm)
        };
    },

    // Интерпретация для возрастной группы
    getAgeInterpretation(age, iq, norm) {
        const ageGroup = this.getAgeGroup(age);
        const iqLevel = this.getIQLevel(iq);
        
        const interpretations = {
            'child': {
                'very-high': 'Ваш результат показывает выдающиеся способности для вашего возраста. Рекомендуется развивать таланты и способности.',
                'high': 'Отличный результат для вашего возраста! Продолжайте развивать интеллектуальные способности.',
                'above-average': 'Хороший результат. Вы развиваетесь быстрее сверстников.',
                'average': 'Нормальное развитие для вашего возраста. Продолжайте учиться и развиваться.',
                'below-average': 'Результат немного ниже среднего. Рекомендуется больше практики и обучения.'
            },
            'teen': {
                'very-high': 'Превосходный результат! Вы обладаете высоким интеллектуальным потенциалом.',
                'high': 'Отличный результат для подростка. Продолжайте развивать свои способности.',
                'above-average': 'Хороший результат. Вы показываете хорошие интеллектуальные способности.',
                'average': 'Средний результат для вашего возраста. Есть потенциал для роста.',
                'below-average': 'Результат ниже среднего. Рекомендуется больше практики.'
            },
            'adult': {
                'very-high': 'Выдающийся результат! Вы обладаете высоким интеллектом.',
                'high': 'Отличный результат! Вы находитесь в верхних 10% населения.',
                'above-average': 'Хороший результат. Выше среднего уровня.',
                'average': 'Средний результат. Соответствует большинству населения.',
                'below-average': 'Результат ниже среднего. Рекомендуется развивать интеллектуальные способности.'
            },
            'senior': {
                'very-high': 'Превосходный результат для вашего возраста!',
                'high': 'Отличный результат! Вы сохранили высокий интеллект.',
                'above-average': 'Хороший результат. Выше среднего для вашего возраста.',
                'average': 'Средний результат для вашего возраста.',
                'below-average': 'Результат ниже среднего. Рекомендуется поддерживать интеллектуальную активность.'
            }
        };

        return interpretations[ageGroup]?.[iqLevel] || 'Результат соответствует вашей возрастной группе.';
    },

    // Определить возрастную группу
    getAgeGroup(age) {
        if (age < 13) return 'child';
        if (age < 18) return 'teen';
        if (age < 60) return 'adult';
        return 'senior';
    },

    // Определить уровень IQ
    getIQLevel(iq) {
        if (iq >= 130) return 'very-high';
        if (iq >= 120) return 'high';
        if (iq >= 110) return 'above-average';
        if (iq >= 90) return 'average';
        return 'below-average';
    },

    // Получить статистику по возрастной группе
    getAgeGroupStats(age) {
        const group = this.getAgeGroup(age);
        const stats = {
            'child': {
                name: 'Дети (8-12 лет)',
                description: 'В этом возрасте интеллект активно развивается. Средний IQ составляет 100.',
                tips: [
                    'Регулярно решайте логические задачи',
                    'Читайте книги и развивайте словарный запас',
                    'Играйте в развивающие игры',
                    'Изучайте новые предметы и темы'
                ]
            },
            'teen': {
                name: 'Подростки (13-17 лет)',
                description: 'Период активного интеллектуального развития. Средний IQ составляет 100.',
                tips: [
                    'Изучайте математику и логику',
                    'Развивайте критическое мышление',
                    'Решайте сложные задачи',
                    'Изучайте иностранные языки'
                ]
            },
            'adult': {
                name: 'Взрослые (18-59 лет)',
                description: 'Период стабильного интеллекта. Средний IQ составляет 100.',
                tips: [
                    'Поддерживайте интеллектуальную активность',
                    'Изучайте новые навыки',
                    'Решайте головоломки и задачи',
                    'Читайте научную литературу'
                ]
            },
            'senior': {
                name: 'Старший возраст (60+ лет)',
                description: 'Интеллект может немного снижаться, но остается стабильным. Средний IQ составляет 100.',
                tips: [
                    'Поддерживайте интеллектуальную активность',
                    'Играйте в интеллектуальные игры',
                    'Изучайте новые темы',
                    'Общайтесь и делитесь знаниями'
                ]
            }
        };
        return stats[group];
    }
};
