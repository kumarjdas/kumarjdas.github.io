/**
 * resultsScene.js
 * Scene for displaying race results
 */

class ResultsScene extends BaseScene {
  /**
   * Create a new results scene
   * @param {Game} game - Reference to the main game object
   * @param {string} name - Scene name
   */
  constructor(game, name = 'results') {
    super(game, name);
    
    // Results data
    this.results = [];
    this.playerResult = null;
    
    // Animation state
    this.revealTimer = 0;
    this.revealDelay = 0.5; // seconds between revealing each position
    this.revealedCount = 0;
    this.animationDone = false;
    
    // Button state
    this.buttons = [];
    this.selectedButton = 0;
  }
  
  /**
   * Initialize the results scene
   */
  init() {
    super.init();
    
    // Get results from game
    if (this.game.raceResults) {
      this.results = this.game.raceResults.sort((a, b) => a.position - b.position);
      this.playerResult = this.results.find(result => result.isPlayer);
    } else {
      // Default results if none provided
      this.results = [
        { position: 1, playerNumber: 1, isPlayer: true, type: 'russet', time: 60000 },
        { position: 2, playerNumber: 2, isPlayer: false, type: 'red', time: 62000 },
        { position: 3, playerNumber: 3, isPlayer: false, type: 'purple', time: 65000 }
      ];
      this.playerResult = this.results[0];
    }
    
    // Reset animation state
    this.revealTimer = 0;
    this.revealedCount = 0;
    this.animationDone = false;
    
    // Setup buttons
    this.setupButtons();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  setupButtons() {
    const centerX = this.game.canvas.width / 2;
    const bottomY = this.game.canvas.height - 100;
    
    this.buttons = [
      {
        text: 'Race Again',
        x: centerX - 120,
        y: bottomY,
        width: 200,
        height: 60,
        action: () => this.raceAgain()
      },
      {
        text: 'Main Menu',
        x: centerX + 120,
        y: bottomY,
        width: 200,
        height: 60,
        action: () => this.returnToMenu()
      }
    ];
    
    this.selectedButton = 0;
  }
  
  addEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
  }
  
  /**
   * Update the results scene
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime) {
    if (!this.isActive) return;
    
    // Update reveal animation
    if (!this.animationDone) {
      this.revealTimer += deltaTime;
      
      // Reveal next position
      if (this.revealTimer >= this.revealDelay && this.revealedCount < this.results.length) {
        this.revealedCount++;
        this.revealTimer = 0;
        
        // Play reveal sound
        // this.game.audio.play('result_reveal');
      }
      
      // Check if animation is done
      if (this.revealedCount >= this.results.length && this.revealTimer >= this.revealDelay) {
        this.animationDone = true;
        
        // Play completion sound
        // this.game.audio.play('results_complete');
      }
    }
  }
  
  /**
   * Draw the results scene
   */
  draw() {
    // Draw background
    const gradient = this.game.ctx.createLinearGradient(0, 0, 0, this.game.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#1a1a2e');
    this.game.ctx.fillStyle = gradient;
    this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
    
    // Draw title
    this.game.ctx.font = 'bold 48px Arial';
    this.game.ctx.textAlign = 'center';
    this.game.ctx.textBaseline = 'middle';
    this.game.ctx.fillStyle = '#FFD700';
    this.game.ctx.shadowColor = '#FF8C00';
    this.game.ctx.shadowBlur = 15;
    this.game.ctx.fillText('RACE RESULTS', this.game.width / 2, 80);
    this.game.ctx.shadowBlur = 0;
    
    // Draw results table
    this.drawResultsTable();
    
    // Draw player message
    this.drawPlayerMessage();
    
    // Draw buttons
    this.drawButtons();
  }
  
  drawResultsTable() {
    const centerX = this.game.width / 2;
    const startY = 160;
    const rowHeight = 60;
    const headerHeight = 40;
    
    // Draw table header
    this.game.ctx.fillStyle = '#4b6cb7';
    this.game.ctx.fillRect(centerX - 300, startY, 600, headerHeight);
    
    this.game.ctx.font = 'bold 20px Arial';
    this.game.ctx.textAlign = 'center';
    this.game.ctx.textBaseline = 'middle';
    this.game.ctx.fillStyle = 'white';
    
    // Draw header columns
    this.game.ctx.fillText('Position', centerX - 225, startY + headerHeight / 2);
    this.game.ctx.fillText('Potato', centerX - 75, startY + headerHeight / 2);
    this.game.ctx.fillText('Player', centerX + 75, startY + headerHeight / 2);
    this.game.ctx.fillText('Time', centerX + 225, startY + headerHeight / 2);
    
    // Draw results rows
    for (let i = 0; i < this.results.length; i++) {
      // Only draw if this position has been revealed
      if (i < this.revealedCount) {
        const result = this.results[i];
        const rowY = startY + headerHeight + i * rowHeight;
        
        // Highlight player's result
        if (result.isPlayer) {
          this.game.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'; // Gold with transparency
        } else {
          this.game.ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';
        }
        this.game.ctx.fillRect(centerX - 300, rowY, 600, rowHeight);
        
        // Draw position with medal for top 3
        this.game.ctx.textAlign = 'center';
        this.game.ctx.font = 'bold 24px Arial';
        
        if (result.position === 1) {
          this.game.ctx.fillStyle = '#FFD700'; // Gold
          this.game.ctx.fillText('🥇 1st', centerX - 225, rowY + rowHeight / 2);
        } else if (result.position === 2) {
          this.game.ctx.fillStyle = '#C0C0C0'; // Silver
          this.game.ctx.fillText('🥈 2nd', centerX - 225, rowY + rowHeight / 2);
        } else if (result.position === 3) {
          this.game.ctx.fillStyle = '#CD7F32'; // Bronze
          this.game.ctx.fillText('🥉 3rd', centerX - 225, rowY + rowHeight / 2);
        } else {
          this.game.ctx.fillStyle = 'white';
          this.game.ctx.fillText(`${result.position}th`, centerX - 225, rowY + rowHeight / 2);
        }
        
        // Draw potato type
        this.game.ctx.fillStyle = 'white';
        this.game.ctx.fillText(result.type.charAt(0).toUpperCase() + result.type.slice(1), centerX - 75, rowY + rowHeight / 2);
        
        // Draw player info
        if (result.isPlayer) {
          this.game.ctx.fillStyle = '#32CD32'; // Lime green
          this.game.ctx.fillText('You', centerX + 75, rowY + rowHeight / 2);
        } else {
          this.game.ctx.fillStyle = 'white';
          this.game.ctx.fillText(`CPU ${result.playerNumber}`, centerX + 75, rowY + rowHeight / 2);
        }
        
        // Draw time
        this.game.ctx.fillStyle = 'white';
        this.game.ctx.fillText(this.formatTime(result.time), centerX + 225, rowY + rowHeight / 2);
      } else {
        // Draw placeholder for unrevealed positions
        const rowY = startY + headerHeight + i * rowHeight;
        
        this.game.ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';
        this.game.ctx.fillRect(centerX - 300, rowY, 600, rowHeight);
        
        this.game.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.game.ctx.textAlign = 'center';
        this.game.ctx.font = 'bold 24px Arial';
        this.game.ctx.fillText('???', centerX, rowY + rowHeight / 2);
      }
    }
  }
  
  drawPlayerMessage() {
    if (!this.playerResult || !this.animationDone) return;
    
    const centerX = this.game.width / 2;
    const messageY = this.game.height - 180;
    
    this.game.ctx.font = 'bold 32px Arial';
    this.game.ctx.textAlign = 'center';
    this.game.ctx.textBaseline = 'middle';
    
    let message = '';
    let color = '';
    
    // Generate message based on player position
    if (this.playerResult.position === 1) {
      message = 'Congratulations! You won the race!';
      color = '#FFD700'; // Gold
    } else if (this.playerResult.position === 2) {
      message = 'So close! You got second place!';
      color = '#C0C0C0'; // Silver
    } else if (this.playerResult.position === 3) {
      message = 'Great effort! You got third place!';
      color = '#CD7F32'; // Bronze
    } else {
      message = `You finished in ${this.playerResult.position}th place. Keep practicing!`;
      color = '#FFFFFF'; // White
    }
    
    // Draw message with glow effect
    this.game.ctx.fillStyle = color;
    this.game.ctx.shadowColor = color;
    this.game.ctx.shadowBlur = 10;
    this.game.ctx.fillText(message, centerX, messageY);
    this.game.ctx.shadowBlur = 0;
  }
  
  drawButtons() {
    if (!this.animationDone) return;
    
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const isSelected = i === this.selectedButton;
      
      // Draw button background
      this.game.ctx.fillStyle = isSelected ? '#FFD700' : '#4b6cb7';
      this.game.ctx.strokeStyle = isSelected ? '#FF8C00' : '#8B4513';
      this.game.ctx.lineWidth = isSelected ? 3 : 2;
      
      // Rounded rectangle
      this.roundRect(this.game.ctx, button.x - button.width / 2, button.y - button.height / 2, 
                      button.width, button.height, 10, true, true);
      
      // Draw button text
      this.game.ctx.font = isSelected ? 'bold 24px Arial' : '20px Arial';
      this.game.ctx.fillStyle = isSelected ? '#8B4513' : 'white';
      this.game.ctx.textAlign = 'center';
      this.game.ctx.textBaseline = 'middle';
      this.game.ctx.fillText(button.text, button.x, button.y);
    }
  }
  
  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
      ctx.stroke();
    }
    if (fill) {
      ctx.fill();
    }
  }
  
  formatTime(milliseconds) {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
  
  handleKeyDown(event) {
    if (!this.isActive || !this.animationDone) return;
    
    switch(event.key) {
      case 'ArrowLeft':
        this.selectedButton = 0;
        break;
      case 'ArrowRight':
        this.selectedButton = 1;
        break;
      case 'Enter':
      case ' ':  // Space key
        this.buttons[this.selectedButton].action();
        break;
      case 'Escape':
        this.returnToMenu();
        break;
    }
  }
  
  handleClick(event) {
    if (!this.isActive || !this.animationDone) return;
    
    const x = event.clientX;
    const y = event.clientY;
    
    // Check if any button was clicked
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      
      if (x >= button.x - button.width / 2 && 
          x <= button.x + button.width / 2 && 
          y >= button.y - button.height / 2 && 
          y <= button.y + button.height / 2) {
        
        this.selectedButton = i;
        button.action();
        break;
      }
    }
  }
  
  raceAgain() {
    this.game.changeScene('race');
  }
  
  returnToMenu() {
    this.game.changeScene('menu');
  }
  
  exit() {
    super.exit();
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleClick);
  }
} 