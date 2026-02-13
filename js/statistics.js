// Модуль статистики с фильтром по периоду и расширенными функциями

const Statistics = {
    currentPeriod: 'all', // all, month, week

    getFilteredResults() {
        if (typeof Storage === 'undefined') return [];
        const results = Storage.getResults();
        if (!results || results.length === 0) return [];
        const now = Date.now();
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        const monthMs = 30 * 24 * 60 * 60 * 1000;
        if (this.currentPeriod === 'week') {
            return results.filter(r => (now - new Date(r.timestamp).getTime()) <= weekMs);
        }
        if (this.currentPeriod === 'month') {
            return results.filter(r => (now - new Date(r.timestamp).getTime()) <= monthMs);
        }
        return results;
    },

    getFilteredStatistics() {
        const results = this.getFilteredResults();
        if (results.length === 0) return null;
        const iqScores = results.map(r => r.iq);
        const avgIQ = iqScores.reduce((a, b) => a + b, 0) / iqScores.length;
        const categoryStats = {};
        results.forEach(result => {
            if (result.categoryBreakdown) {
                Object.keys(result.categoryBreakdown).forEach(category => {
                    if (!categoryStats[category]) categoryStats[category] = [];
                    categoryStats[category].push(result.categoryBreakdown[category]);
                });
            }
        });
        const avgCategoryStats = {};
        Object.keys(categoryStats).forEach(category => {
            const scores = categoryStats[category];
            avgCategoryStats[category] = scores.reduce((a, b) => a + b, 0) / scores.length;
        });
        const totalTime = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
        const avgTimeSec = results.length ? Math.round(totalTime / results.length) : 0;
        return {
            totalTests: results.length,
            averageIQ: Math.round(avgIQ),
            maxIQ: Math.max(...iqScores),
            minIQ: Math.min(...iqScores),
            averageCategoryStats: avgCategoryStats,
            recentResults: results.slice(-10).reverse(),
            avgTimeSec
        };
    },

    getTrend() {
        const results = this.getFilteredResults();
        if (!results || results.length < 2) return { text: '—', icon: '➡️', direction: 0 };
        const mid = Math.floor(results.length / 2);
        const firstHalf = results.slice(0, mid).map(r => r.iq);
        const secondHalf = results.slice(mid).map(r => r.iq);
        const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const diff = Math.round(avg2 - avg1);
        if (diff > 2) return { text: '+' + diff, icon: '📈', direction: 1 };
        if (diff < -2) return { text: String(diff), icon: '📉', direction: -1 };
        return { text: 'стабильно', icon: '➡️', direction: 0 };
    },

    updateKPI() {
        const stats = this.getFilteredStatistics();
        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        set('stat-total-tests', stats ? stats.totalTests : 0);
        set('stat-avg-iq', stats ? stats.averageIQ : '—');
        set('stat-best-iq', stats ? stats.maxIQ : '—');
        if (stats && stats.avgTimeSec !== undefined) {
            const m = Math.floor(stats.avgTimeSec / 60);
            const s = stats.avgTimeSec % 60;
            set('stat-avg-time', m + ':' + (s < 10 ? '0' : '') + s);
        } else set('stat-avg-time', '—');
        const streak = typeof Activity !== 'undefined' ? Activity.getLongestStreak() : 0;
        set('stat-streak', streak);
        const trend = this.getTrend();
        set('stat-trend-icon', trend.icon);
        set('stat-trend-text', trend.text);
        const wrap = document.getElementById('stat-trend-wrap');
        if (wrap) {
            wrap.classList.remove('trend-up', 'trend-down');
            if (trend.direction === 1) wrap.classList.add('trend-up');
            else if (trend.direction === -1) wrap.classList.add('trend-down');
        }
    },

    showIQChart() {
        const results = this.getFilteredResults();
        const canvas = document.getElementById('iq-chart-canvas');
        const hint = document.getElementById('iq-chart-hint');
        if (!canvas) return;
        if (hint) hint.style.display = results && results.length > 0 ? '' : 'none';

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        if (!results || results.length === 0) {
            ctx.fillStyle = 'var(--text-secondary, #666)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных за выбранный период', canvas.width / 2, canvas.height / 2);
            return;
        }

        const padding = 50;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        const minIQ = 70, maxIQ = 160;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const lineColor = 'var(--primary-color, #667eea)';
        const gridColor = 'var(--border-color, #eee)';
        const textColor = 'var(--text-secondary, #666)';

        for (let iq = 80; iq <= 140; iq += 20) {
            const y = padding + chartHeight - ((iq - minIQ) / (maxIQ - minIQ)) * chartHeight;
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = textColor;
            ctx.font = '11px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(iq, padding - 8, y + 4);
        }

        if (results.length >= 1) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            results.forEach((result, index) => {
                const x = padding + (results.length === 1 ? chartWidth / 2 : (index / (results.length - 1)) * chartWidth);
                const y = padding + chartHeight - ((result.iq - minIQ) / (maxIQ - minIQ)) * chartHeight;
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.fillStyle = lineColor;
            results.forEach((result, index) => {
                const x = padding + (results.length === 1 ? chartWidth / 2 : (index / (results.length - 1)) * chartWidth);
                const y = padding + chartHeight - ((result.iq - minIQ) / (maxIQ - minIQ)) * chartHeight;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    },

    showCategoryChart() {
        const stats = this.getFilteredStatistics();
        const canvas = document.getElementById('category-chart-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        if (!stats || !stats.averageCategoryStats) {
            ctx.fillStyle = 'var(--text-secondary, #666)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
            return;
        }

        const categories = Object.keys(stats.averageCategoryStats);
        if (categories.length === 0) {
            ctx.fillStyle = 'var(--text-secondary, #666)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
            return;
        }

        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        const barWidth = chartWidth / categories.length;
        const maxValue = 100;
        const colors = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        categories.forEach((category, index) => {
            const value = stats.averageCategoryStats[category];
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barWidth + barWidth * 0.1;
            const y = padding + chartHeight - barHeight;
            const w = barWidth * 0.8;
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, w, barHeight);
            ctx.fillStyle = 'var(--text-secondary, #666)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const shortName = category.length > 10 ? category.substring(0, 8) + '…' : category;
            ctx.fillText(shortName, x + w / 2, canvas.height - padding + 14);
            ctx.fillText(Math.round(value) + '%', x + w / 2, y - 4);
        });
    },

    showProgressChart() {
        const results = this.getFilteredResults();
        const canvas = document.getElementById('progress-chart-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        if (!results || results.length === 0) {
            ctx.fillStyle = 'var(--text-secondary, #666)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
            return;
        }

        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        const barGap = 4;
        const barCount = results.length;
        const totalGaps = (barCount - 1) * barGap;
        const barWidth = (chartWidth - totalGaps) / barCount;
        const maxVal = 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        results.forEach((result, index) => {
            const pct = result.percentage !== undefined ? result.percentage : (result.correctAnswers / result.totalQuestions) * 100;
            const h = (pct / maxVal) * chartHeight;
            const x = padding + index * (barWidth + barGap);
            const y = padding + chartHeight - h;
            const gradient = ctx.createLinearGradient(0, y + h, 0, y);
            gradient.addColorStop(0, 'var(--primary-color, #667eea)');
            gradient.addColorStop(1, 'var(--secondary-color, #764ba2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, h);
        });
        ctx.fillStyle = 'var(--text-secondary, #666)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Тест 1', padding + barWidth / 2, canvas.height - padding + 14);
        if (barCount > 1) {
            ctx.fillText('…', padding + chartWidth / 2 - barWidth / 2 + barWidth / 2, canvas.height - padding + 14);
            ctx.fillText('Тест ' + barCount, canvas.width - padding - barWidth / 2, canvas.height - padding + 14);
        }
    },

    showComparisonStats() {
        const container = document.getElementById('comparison-stats');
        if (!container) return;

        const stats = this.getFilteredStatistics();
        if (!stats || stats.totalTests === 0) {
            container.innerHTML = '<p class="comparison-empty">Пройдите тесты, чтобы увидеть сравнение</p>';
            return;
        }

        const lastResult = this.getFilteredResults().pop();
        const iq = lastResult.iq || stats.averageIQ;
        const age = lastResult.userAge || (window.currentUserInfo && window.currentUserInfo.age);
        let comparisonHtml = '';

        if (iq >= 120) {
            comparisonHtml = '<p class="comparison-text">Ваш результат в <strong>топ-10%</strong> по уровню интеллекта.</p>';
        } else if (iq >= 110) {
            comparisonHtml = '<p class="comparison-text">Вы выше <strong>большинства</strong> по результатам теста.</p>';
        } else if (iq >= 90) {
            comparisonHtml = '<p class="comparison-text">Ваш результат в <strong>среднем диапазоне</strong> (норма 90–110).</p>';
        } else {
            comparisonHtml = '<p class="comparison-text">Рекомендуем практиковаться для улучшения результата.</p>';
        }

        if (typeof Analysis !== 'undefined' && age && Analysis.compareWithOthers) {
            try {
                const comp = Analysis.compareWithOthers(iq, age);
                if (comp && comp.comparison) {
                    comparisonHtml += '<p class="comparison-detail">' + comp.comparison + '</p>';
                }
            } catch (e) {}
        }

        comparisonHtml += '<div class="comparison-summary">';
        comparisonHtml += '<span class="comparison-iq">IQ ' + (lastResult.iq || stats.averageIQ) + '</span>';
        comparisonHtml += '<span class="comparison-tests">на основе ' + stats.totalTests + ' ' + (stats.totalTests === 1 ? 'теста' : 'тестов') + '</span>';
        comparisonHtml += '</div>';
        container.innerHTML = comparisonHtml;
    },

    setupPeriodFilter() {
        const btns = document.querySelectorAll('.period-btn');
        if (!btns.length || btns[0].dataset.bound) return;
        btns[0].dataset.bound = '1';
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof Sounds !== 'undefined') Sounds.playClick();
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updateKPI();
                this.showIQChart();
                this.showCategoryChart();
                this.showProgressChart();
                this.showComparisonStats();
            });
        });
    },

    init() {
        try {
            this.setupPeriodFilter();
            this.updateKPI();
            this.showIQChart();
            this.showCategoryChart();
            this.showProgressChart();
            this.showComparisonStats();
        } catch (error) {
            console.error('Ошибка при инициализации статистики:', error);
        }
    }
};
