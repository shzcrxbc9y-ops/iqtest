// Мини-игры для тренировки интеллекта

const MiniGames = {
    // Игра на память
    memoryGame: {
        init() {
            return {
                cards: this.generateCards(),
                flipped: [],
                matched: [],
                moves: 0,
                startTime: Date.now()
            };
        },
        
        generateCards() {
            const symbols = ['🧠', '⭐', '🎯', '🏆', '💎', '🌟', '🎮', '🎨'];
            const cards = [...symbols, ...symbols];
            return this.shuffle(cards);
        },
        
        shuffle(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },
        
        flipCard(gameState, index) {
            if (gameState.flipped.length === 2 || gameState.matched.includes(index)) {
                return gameState;
            }
            
            const newState = {
                ...gameState,
                flipped: [...gameState.flipped, index],
                moves: gameState.moves + 1
            };
            
            if (newState.flipped.length === 2) {
                const [first, second] = newState.flipped;
                if (gameState.cards[first] === gameState.cards[second]) {
                    newState.matched = [...newState.matched, first, second];
                    newState.flipped = [];
                    Sounds.playSuccess();
                } else {
                    setTimeout(() => {
                        newState.flipped = [];
                    }, 1000);
                }
            }
            
            return newState;
        }
    },

    // Игра на скорость реакции
    reactionGame: {
        init() {
            return {
                targetTime: null,
                clicks: [],
                currentRound: 0,
                totalRounds: 5
            };
        },
        
        startRound(gameState) {
            const delay = 1000 + Math.random() * 3000;
            setTimeout(() => {
                gameState.targetTime = Date.now();
                Sounds.playTick();
            }, delay);
            return gameState;
        },
        
        click(gameState) {
            if (!gameState.targetTime) return gameState;
            
            const reactionTime = Date.now() - gameState.targetTime;
            const newState = {
                ...gameState,
                clicks: [...gameState.clicks, reactionTime],
                currentRound: gameState.currentRound + 1,
                targetTime: null
            };
            
            if (newState.currentRound < newState.totalRounds) {
                this.startRound(newState);
            } else {
                Sounds.playComplete();
            }
            
            return newState;
        },
        
        getAverageReaction(gameState) {
            if (gameState.clicks.length === 0) return 0;
            const sum = gameState.clicks.reduce((a, b) => a + b, 0);
            return Math.round(sum / gameState.clicks.length);
        }
    },

    // Игра на логику - последовательности
    sequenceGame: {
        init() {
            const sequences = [
                { pattern: [2, 4, 6, 8], answer: 10, type: 'arithmetic' },
                { pattern: [1, 4, 9, 16], answer: 25, type: 'squares' },
                { pattern: [5, 10, 20, 40], answer: 80, type: 'geometric' },
                { pattern: [1, 1, 2, 3, 5], answer: 8, type: 'fibonacci' }
            ];
            
            const random = sequences[Math.floor(Math.random() * sequences.length)];
            return {
                sequence: random.pattern,
                answer: random.answer,
                type: random.type,
                userAnswer: null,
                correct: false
            };
        },
        
        checkAnswer(gameState, answer) {
            const correct = parseInt(answer) === gameState.answer;
            return {
                ...gameState,
                userAnswer: answer,
                correct
            };
        }
    }
};
