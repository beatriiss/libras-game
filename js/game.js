// Banco de palavras por nível
const wordBank = {
    facil: ['GATO', 'CASA', 'BOLA', 'MESA', 'PATO', 'SAPO', 'UVA', 'SOL', 'MAO', 'PE'],
    medio: ['CACHORRO', 'PORTA', 'SUCO', 'ROSA', 'AZUL', 'VERDE', 'MAMA', 'PAPA', 'PERA', 'COCO'],
    dificil: ['CACHORRO', 'IRMAO', 'BRANCO', 'PRETO', 'PIZZA', 'ARROZ', 'FEIJAO', 'CABECA', 'NARIZ', 'PERNA']
};

// Configuração de níveis
const levelConfig = {
    facil: { nome: 'Fácil', palavras: 5, cor: '#4CAF50' },
    medio: { nome: 'Médio', palavras: 5, cor: '#FFA500' },
    dificil: { nome: 'Difícil', palavras: 5, cor: '#E74C3C' }
};

// Estado do jogo
let gameState = {
    currentWord: '',
    currentLevel: 'facil',
    progress: [],
    score: 0,
    attempts: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    wordsCompleted: 0,
    totalWords: 15, // 5 fácil + 5 médio + 5 difícil
    focusedKeyIndex: -1,
    usedWords: {
        facil: [],
        medio: [],
        dificil: []
    }
};

// Elementos DOM
let elements = {};

// Inicializar jogo
function initGame() {
    // Inicializar elementos DOM
    elements = {
        targetWord: document.getElementById('targetWord'),
        progressLetters: document.getElementById('progressLetters'),
        score: document.getElementById('score'),
        level: document.getElementById('level'),
        wordProgress: document.getElementById('wordProgress'),
        attempts: document.getElementById('attempts'),
        feedback: document.getElementById('feedback'),
        keys: document.querySelectorAll('.key'),
        resetBtn: document.getElementById('resetBtn'),
        nextBtn: document.getElementById('nextBtn'),
        zoomModal: document.getElementById('zoomModal'),
        zoomImage: document.getElementById('zoomImage'),
        modalLetter: document.getElementById('modalLetter'),
        modalClose: document.getElementById('modalClose'),
        completeModal: document.getElementById('completeModal'),
        completedWord: document.getElementById('completedWord'),
        finalAttempts: document.getElementById('finalAttempts'),
        continueBtn: document.getElementById('continueBtn'),
        gameOverModal: document.getElementById('gameOverModal'),
        finalScore: document.getElementById('finalScore'),
        totalWords: document.getElementById('totalWords'),
        accuracy: document.getElementById('accuracy'),
        congratsMsg: document.getElementById('congratsMsg'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        infoBtn: document.getElementById('infoBtn'),
        infoModal: document.getElementById('infoModal'),
        infoModalClose: document.getElementById('infoModalClose')
    };
    
    selectRandomWord();
    setupEventListeners();
    updateDisplay();
}

// Determinar nível atual baseado no progresso
function getCurrentLevel() {
    if (gameState.wordsCompleted < 5) {
        return 'facil';
    } else if (gameState.wordsCompleted < 10) {
        return 'medio';
    } else {
        return 'dificil';
    }
}

// Selecionar palavra aleatória do nível atual
function selectRandomWord() {
    const level = getCurrentLevel();
    gameState.currentLevel = level;
    
    const levelWords = wordBank[level];
    const usedWords = gameState.usedWords[level];
    
    // Filtrar palavras já usadas
    const availableWords = levelWords.filter(word => !usedWords.includes(word));
    
    if (availableWords.length === 0) {
        // Não há mais palavras neste nível, avançar ou terminar jogo
        return;
    }
    
    gameState.currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    gameState.usedWords[level].push(gameState.currentWord);
    gameState.progress = [];
    gameState.attempts = 0;
}

// Atualizar display
function updateDisplay() {
    // Palavra alvo
    elements.targetWord.textContent = gameState.currentWord;
    
    // Nível
    const levelName = levelConfig[gameState.currentLevel].nome;
    elements.level.textContent = levelName;
    elements.level.style.color = levelConfig[gameState.currentLevel].cor;
    
    // Pontuação
    elements.score.textContent = gameState.score;
    
    // Progresso de palavras
    elements.wordProgress.textContent = `${gameState.wordsCompleted + 1}/${gameState.totalWords}`;
    
    // Tentativas
    elements.attempts.textContent = gameState.attempts;
    
    // Progresso
    updateProgress();
}

// Atualizar progresso visual
function updateProgress() {
    elements.progressLetters.innerHTML = '';
    
    for (let i = 0; i < gameState.currentWord.length; i++) {
        const slot = document.createElement('span');
        slot.className = 'letter-slot';
        
        if (gameState.progress[i]) {
            slot.textContent = gameState.progress[i];
            slot.classList.add('filled');
        } else {
            slot.textContent = '_';
            slot.classList.add('empty');
        }
        
        elements.progressLetters.appendChild(slot);
    }
}

// Verificar letra
function checkLetter(letter) {
    const currentIndex = gameState.progress.length;
    const expectedLetter = gameState.currentWord[currentIndex];
    
    gameState.attempts++;
    gameState.totalAttempts++;
    elements.attempts.textContent = gameState.attempts;
    
    if (letter === expectedLetter) {
        // Letra correta
        gameState.progress.push(letter);
        gameState.correctAttempts++;
        updateProgress();
        showFeedback('Correto! ✓', 'success');
        
        // Verificar se completou a palavra
        if (gameState.progress.length === gameState.currentWord.length) {
            setTimeout(() => {
                completeWord();
            }, 500);
        }
        
        return true;
    } else {
        // Letra errada
        showFeedback('Ops! Tente outra letra', 'error');
        return false;
    }
}

// Mostrar feedback
function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${type} show`;
    
    setTimeout(() => {
        elements.feedback.classList.remove('show');
    }, 2000);
}

// Completar palavra
function completeWord() {
    gameState.wordsCompleted++;
    
    // Calcular pontos
    const wordLength = gameState.currentWord.length;
    const extraAttempts = gameState.attempts - wordLength;
    const basePoints = 50;
    const levelMultiplier = gameState.currentLevel === 'facil' ? 1 : gameState.currentLevel === 'medio' ? 1.5 : 2;
    const points = Math.max(10, Math.floor((basePoints - (extraAttempts * 5)) * levelMultiplier));
    
    gameState.score += points;
    elements.score.textContent = gameState.score;
    
    // Verificar se o jogo terminou
    if (gameState.wordsCompleted >= gameState.totalWords) {
        setTimeout(() => {
            showGameOver();
        }, 1000);
    } else {
        // Mostrar modal de conclusão
        elements.completedWord.textContent = gameState.currentWord;
        elements.finalAttempts.textContent = gameState.attempts;
        elements.completeModal.classList.add('show');
    }
}

// Mostrar tela de game over
function showGameOver() {
    const accuracy = Math.round((gameState.correctAttempts / gameState.totalAttempts) * 100);
    
    elements.finalScore.textContent = gameState.score;
    elements.totalWords.textContent = gameState.wordsCompleted;
    elements.accuracy.textContent = accuracy + '%';
    
    // Mensagem baseada na performance
    let message = '';
    if (accuracy >= 90) {
        message = '🌟 Excepcional! Você domina a datilologia!';
    } else if (accuracy >= 75) {
        message = '🎉 Muito bom! Continue praticando!';
    } else if (accuracy >= 60) {
        message = '👍 Bom trabalho! Você está progredindo!';
    } else {
        message = '💪 Continue tentando! A prática leva à perfeição!';
    }
    
    elements.congratsMsg.textContent = message;
    elements.gameOverModal.classList.add('show');
}

// Próxima palavra
function nextWord() {
    selectRandomWord();
    updateDisplay();
    elements.completeModal.classList.remove('show');
}

// Recomeçar palavra atual
function resetWord() {
    gameState.progress = [];
    gameState.attempts = 0;
    updateDisplay();
    showFeedback('Palavra reiniciada', 'success');
}

// Reiniciar jogo
function resetGame() {
    gameState = {
        currentWord: '',
        currentLevel: 'facil',
        progress: [],
        score: 0,
        attempts: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        wordsCompleted: 0,
        totalWords: 15,
        focusedKeyIndex: -1,
        usedWords: {
            facil: [],
            medio: [],
            dificil: []
        }
    };
    
    elements.gameOverModal.classList.remove('show');
    selectRandomWord();
    updateDisplay();
}

// Capitalizar primeira letra
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event Listeners
function setupEventListeners() {
    // Clique nas teclas
    elements.keys.forEach((key) => {
        key.addEventListener('click', (e) => {
            if (e.target.classList.contains('zoom-btn')) {
                return;
            }
            
            const letter = key.getAttribute('data-letter');
            const isCorrect = checkLetter(letter);
            
            key.classList.add(isCorrect ? 'correct' : 'wrong');
            setTimeout(() => {
                key.classList.remove('correct', 'wrong');
            }, 600);
        });
        
        const zoomBtn = key.querySelector('.zoom-btn');
        if (zoomBtn) {
            zoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const letter = key.getAttribute('data-letter');
                showZoomModal(letter);
            });
        }
    });
    
    // Botões de ação
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetWord);
    }
    
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', nextWord);
    }
    
    if (elements.continueBtn) {
        elements.continueBtn.addEventListener('click', nextWord);
    }
    
    if (elements.playAgainBtn) {
        elements.playAgainBtn.addEventListener('click', resetGame);
    }
    
    // Botão de informações
    if (elements.infoBtn) {
        elements.infoBtn.addEventListener('click', () => {
            elements.infoModal.classList.add('show');
        });
    }
    
    if (elements.infoModalClose) {
        elements.infoModalClose.addEventListener('click', () => {
            elements.infoModal.classList.remove('show');
        });
    }
    
    // Modal de zoom
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', () => {
            elements.zoomModal.classList.remove('show');
        });
    }
    
    if (elements.zoomModal) {
        elements.zoomModal.addEventListener('click', (e) => {
            if (e.target === elements.zoomModal) {
                elements.zoomModal.classList.remove('show');
            }
        });
    }
    
    // Modal de conclusão
    if (elements.completeModal) {
        elements.completeModal.addEventListener('click', (e) => {
            if (e.target === elements.completeModal) {
                elements.completeModal.classList.remove('show');
            }
        });
    }
    
    // Modal de info
    if (elements.infoModal) {
        elements.infoModal.addEventListener('click', (e) => {
            if (e.target === elements.infoModal) {
                elements.infoModal.classList.remove('show');
            }
        });
    }
    
    // Toggle de exibição de letras
    const showLettersCheckbox = document.getElementById('showLetters');
    const keyboard = document.querySelector('.keyboard');
    
    if (showLettersCheckbox && keyboard) {
        showLettersCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                keyboard.classList.remove('hide-letters');
            } else {
                keyboard.classList.add('hide-letters');
            }
        });
    }
    
    // Navegação por teclado
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Mostrar modal de zoom
function showZoomModal(letter) {
    elements.zoomImage.src = `assets/imagens/abc/${letter}.png`;
    elements.zoomImage.alt = `Letra ${letter} em Libras`;
    elements.modalLetter.textContent = `Letra: ${letter}`;
    elements.zoomModal.classList.add('show');
}

// Navegação por teclado
function handleKeyboardNavigation(e) {
    const keysArray = Array.from(elements.keys);
    
    switch(e.key) {
        case 'ArrowRight':
            e.preventDefault();
            navigateKeys(1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            navigateKeys(-1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            navigateKeys(10);
            break;
        case 'ArrowUp':
            e.preventDefault();
            navigateKeys(-10);
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            if (gameState.focusedKeyIndex >= 0) {
                const focusedKey = keysArray[gameState.focusedKeyIndex];
                const letter = focusedKey.getAttribute('data-letter');
                const isCorrect = checkLetter(letter);
                
                focusedKey.classList.add(isCorrect ? 'correct' : 'wrong');
                setTimeout(() => {
                    focusedKey.classList.remove('correct', 'wrong');
                }, 600);
            }
            break;
        case 'Escape':
            if (elements.zoomModal) {
                elements.zoomModal.classList.remove('show');
            }
            if (elements.completeModal) {
                elements.completeModal.classList.remove('show');
            }
            if (elements.infoModal) {
                elements.infoModal.classList.remove('show');
            }
            break;
    }
}

// Navegar entre teclas
function navigateKeys(direction) {
    const keysArray = Array.from(elements.keys);
    
    if (gameState.focusedKeyIndex >= 0) {
        keysArray[gameState.focusedKeyIndex].classList.remove('focused');
    }
    
    if (gameState.focusedKeyIndex === -1) {
        gameState.focusedKeyIndex = 0;
    } else {
        gameState.focusedKeyIndex += direction;
        
        if (gameState.focusedKeyIndex < 0) {
            gameState.focusedKeyIndex = 0;
        } else if (gameState.focusedKeyIndex >= keysArray.length) {
            gameState.focusedKeyIndex = keysArray.length - 1;
        }
    }
    
    keysArray[gameState.focusedKeyIndex].classList.add('focused');
    keysArray[gameState.focusedKeyIndex].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
}

// Iniciar quando o DOM carregar
document.addEventListener('DOMContentLoaded', initGame);