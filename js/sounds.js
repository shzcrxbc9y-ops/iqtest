// Система звуковых эффектов

const Sounds = {
    enabled: true,
    volume: 0.5,

    // Инициализация
    init() {
        try {
            const saved = localStorage.getItem('soundSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.enabled = settings.enabled !== false;
                this.volume = settings.volume || 0.5;
            }
        } catch (error) {
            console.warn('Ошибка загрузки настроек звука:', error);
            this.enabled = true;
            this.volume = 0.5;
        }
    },

    // Воспроизведение звука через Web Audio API
    playSound(frequency, duration, type = 'sine') {
        if (!this.enabled) return;

        try {
            // Проверка поддержки Web Audio API
            if (!window.AudioContext && !window.webkitAudioContext) {
                return; // Браузер не поддерживает Web Audio API
            }
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Проверка состояния контекста
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(() => {});
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Тихая обработка ошибок звука
            if (console && console.debug) {
                console.debug('Звук недоступен:', e);
            }
        }
    },

    // Звуки для разных событий
    playClick() {
        this.playSound(800, 0.1, 'sine');
    },

    playSuccess() {
        this.playSound(523, 0.2, 'sine');
        setTimeout(() => this.playSound(659, 0.2, 'sine'), 100);
        setTimeout(() => this.playSound(784, 0.3, 'sine'), 200);
    },

    playError() {
        this.playSound(200, 0.3, 'sawtooth');
    },

    playComplete() {
        // Мелодия завершения
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.3, 'sine'), i * 150);
        });
    },

    playAchievement() {
        // Специальная мелодия для достижений
        const notes = [659, 784, 988, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.4, 'sine'), i * 100);
        });
    },

    playTick() {
        this.playSound(1000, 0.05, 'sine');
    },

    // Переключение звука
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundSettings', JSON.stringify({
            enabled: this.enabled,
            volume: this.volume
        }));
        return this.enabled;
    },

    // Установка громкости
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('soundSettings', JSON.stringify({
            enabled: this.enabled,
            volume: this.volume
        }));
    }
};

// Инициализация звуков
Sounds.init();
