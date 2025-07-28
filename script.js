class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        
        // Winning combinations
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.bindEvents();
        this.updateDisplay();
        this.loadScores();
    }
    
    bindEvents() {
        // Cell click events
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        // Button events
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
    }
    
    handleCellClick(event) {
        const cellIndex = parseInt(event.target.getAttribute('data-index'));
        
        // Check if cell is already filled or game is not active
        if (this.board[cellIndex] !== '' || !this.gameActive) {
            return;
        }
        
        // Make the move
        this.makeMove(cellIndex);
    }
    
    makeMove(cellIndex) {
        // Update board state
        this.board[cellIndex] = this.currentPlayer;
        
        // Update cell display
        const cell = document.querySelector(`[data-index="${cellIndex}"]`);
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Check for win or draw
        if (this.checkWinner()) {
            this.endGame(`Player ${this.currentPlayer} wins!`);
            this.scores[this.currentPlayer]++;
            this.updateScores();
            this.highlightWinningCells();
        } else if (this.checkDraw()) {
            this.endGame("It's a draw!");
            this.scores.draw++;
            this.updateScores();
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateDisplay();
        }
    }
    
    checkWinner() {
        return this.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    getWinningCombination() {
        return this.winningCombinations.find(combination => {
            const [a, b, c] = combination;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }
    
    highlightWinningCells() {
        const winningCombination = this.getWinningCombination();
        if (winningCombination) {
            winningCombination.forEach(index => {
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.classList.add('winning');
            });
        }
    }
    
    endGame(message) {
        this.gameActive = false;
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = message;
        
        if (message.includes('wins')) {
            statusElement.className = 'game-status winner';
        } else if (message.includes('draw')) {
            statusElement.className = 'game-status draw';
        }
        
        // Add celebration effect
        this.addCelebrationEffect();
    }
    
    addCelebrationEffect() {
        const container = document.querySelector('.container');
        container.style.animation = 'celebration 0.8s ease-in-out';
        
        setTimeout(() => {
            container.style.animation = '';
        }, 800);
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Reset status
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = 'Game in progress';
        statusElement.className = 'game-status';
        
        this.updateDisplay();
    }
    
    newGame() {
        this.resetGame();
        this.scores = { X: 0, O: 0, draw: 0 };
        this.updateScores();
        this.saveScores();
    }
    
    updateDisplay() {
        document.getElementById('current-player').textContent = this.currentPlayer;
    }
    
    updateScores() {
        document.getElementById('score-x').textContent = this.scores.X;
        document.getElementById('score-o').textContent = this.scores.O;
        document.getElementById('score-draw').textContent = this.scores.draw;
        this.saveScores();
    }
    
    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }
    
    loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScores();
        }
    }
}

// Game Controls and Keyboard Support
class GameEnhancements {
    constructor(game) {
        this.game = game;
        this.addKeyboardSupport();
        this.addSoundEffects();
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (event) => {
            // Number keys 1-9 for cell selection
            if (event.key >= '1' && event.key <= '9') {
                const cellIndex = parseInt(event.key) - 1;
                if (this.game.board[cellIndex] === '' && this.game.gameActive) {
                    this.game.makeMove(cellIndex);
                }
            }
            
            // 'R' for reset
            if (event.key.toLowerCase() === 'r') {
                this.game.resetGame();
            }
            
            // 'N' for new game
            if (event.key.toLowerCase() === 'n') {
                this.game.newGame();
            }
        });
    }
    
    addSoundEffects() {
        // Create audio context for sound effects
        this.audioContext = null;
        
        // Initialize audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }
    
    playSound(frequency, duration) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

// AI Player (Optional Enhancement)
class AIPlayer {
    constructor(game) {
        this.game = game;
        this.difficulty = 'medium'; // easy, medium, hard
    }
    
    makeMove() {
        if (!this.game.gameActive || this.game.currentPlayer !== 'O') return;
        
        let moveIndex;
        
        switch (this.difficulty) {
            case 'easy':
                moveIndex = this.getRandomMove();
                break;
            case 'medium':
                moveIndex = this.getMediumMove();
                break;
            case 'hard':
                moveIndex = this.getBestMove();
                break;
            default:
                moveIndex = this.getRandomMove();
        }
        
        if (moveIndex !== -1) {
            setTimeout(() => {
                this.game.makeMove(moveIndex);
            }, 500); // Add delay for better UX
        }
    }
    
    getRandomMove() {
        const availableCells = this.game.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableCells.length > 0 
            ? availableCells[Math.floor(Math.random() * availableCells.length)]
            : -1;
    }
    
    getMediumMove() {
        // Try to win or block opponent
        const winMove = this.findWinningMove('O');
        if (winMove !== -1) return winMove;
        
        const blockMove = this.findWinningMove('X');
        if (blockMove !== -1) return blockMove;
        
        // Otherwise random move
        return this.getRandomMove();
    }
    
    getBestMove() {
        // Minimax algorithm for optimal play
        return this.minimax(this.game.board, 'O').index;
    }
    
    findWinningMove(player) {
        for (let i = 0; i < 9; i++) {
            if (this.game.board[i] === '') {
                this.game.board[i] = player;
                const isWinning = this.game.winningCombinations.some(combination => {
                    const [a, b, c] = combination;
                    return this.game.board[a] && 
                           this.game.board[a] === this.game.board[b] && 
                           this.game.board[a] === this.game.board[c];
                });
                this.game.board[i] = ''; // Undo move
                
                if (isWinning) return i;
            }
        }
        return -1;
    }
    
    minimax(board, player) {
        const availableCells = board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        // Check for terminal states
        if (this.checkWin(board, 'X')) return { score: -10 };
        if (this.checkWin(board, 'O')) return { score: 10 };
        if (availableCells.length === 0) return { score: 0 };
        
        const moves = [];
        
        for (let i = 0; i < availableCells.length; i++) {
            const move = {};
            move.index = availableCells[i];
            board[availableCells[i]] = player;
            
            if (player === 'O') {
                const result = this.minimax(board, 'X');
                move.score = result.score;
            } else {
                const result = this.minimax(board, 'O');
                move.score = result.score;
            }
            
            board[availableCells[i]] = '';
            moves.push(move);
        }
        
        let bestMove;
        if (player === 'O') {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        
        return moves[bestMove];
    }
    
    checkWin(board, player) {
        return this.game.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return board[a] === player && 
                   board[b] === player && 
                   board[c] === player;
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToe();
    const enhancements = new GameEnhancements(game);
    
    // Optional: Add AI player
    // const aiPlayer = new AIPlayer(game);
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.className = 'instructions';
    instructions.innerHTML = `
        <p><strong>How to play:</strong></p>
        <p>• Click on cells or use number keys 1-9</p>
        <p>• Press 'R' to reset, 'N' for new game</p>
        <p>• Get three in a row to win!</p>
    `;
    instructions.style.cssText = `
        margin-top: 15px;
        padding: 10px;
        background: rgba(74, 85, 104, 0.05);
        border-radius: 10px;
        font-size: 0.9em;
        color: #4a5568;
    `;
    
    document.querySelector('.container').appendChild(instructions);
    
    console.log('🎮 Tic-Tac-Toe game initialized successfully!');
    console.log('🎯 Use keyboard shortcuts: 1-9 for moves, R for reset, N for new game');
});