/**
 * menuScene.js
 * Menu scene for the potato racing game
 */

class MenuScene extends BaseScene {
  /**
   * Create a new MenuScene
   * @param {Game} game - Game instance
   * @param {string} name - Scene name
   */
  constructor(game, name) {
    super(game, name);
    
    // Menu state
    this.selectedOption = 0;
    this.menuOptions = [];
    this.logoScale = 1;
    this.logoDirection = 1;
    
    // Menu animations
    this.bgParticles = [];
    this.bgHue = 0;
    
    // Create menu elements
    this.createMenuOptions();
  }
  
  /**
   * Initialize the scene
   */
  init() {
    super.init();
    
    // Reset menu state
    this.selectedOption = 0;
    this.logoScale = 1;
    this.bgHue = 0;
    
    // Reset particles
    this.bgParticles = [];
    
    // Create menu options
    this.createMenuOptions();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Play menu music if available
    if (this.game.assets && this.game.assets.sounds && this.game.assets.sounds.music) {
      if (this.game.state && this.game.state.settings && typeof this.game.state.settings.musicVolume === 'number') {
        this.game.assets.sounds.music.setVolume(this.game.state.settings.musicVolume);
      }
      this.game.assets.sounds.music.loop();
    }
  }
  
  /**
   * Exit the scene
   */
  exit() {
    super.exit();
    
    // Remove event listeners
    if (this.boundKeyPressed) {
      document.removeEventListener('keydown', this.boundKeyPressed);
    }
    
    if (this.boundMousePressed) {
      document.removeEventListener('mousedown', this.boundMousePressed);
    }
    
    // Stop music
    if (this.game.assets && this.game.assets.sounds && this.game.assets.sounds.music) {
      this.game.assets.sounds.music.stop();
    }
  }
  
  /**
   * Create menu options
   */
  createMenuOptions() {
    this.menuOptions = [
      {
        text: 'Start Race',
        action: () => {
          this.game.changeScene('race');
        }
      },
      {
        text: 'Customize Potato',
        action: () => {
          this.showCustomizationScreen();
        }
      },
      {
        text: 'Instructions',
        action: () => {
          this.showInstructionsScreen();
        }
      },
      {
        text: 'Settings',
        action: () => {
          this.showSettingsScreen();
        }
      }
    ];
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Ensure correct 'this' binding for keyPressed
    const boundKeyPressed = this.keyPressed.bind(this);
    document.addEventListener('keydown', boundKeyPressed);
    
    // Store the bound function to allow cleanup later
    this.boundKeyPressed = boundKeyPressed;
    
    // Create bound mouse handler
    const boundMousePressed = (event) => {
      const rect = this.game.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.mousePressed(x, y);
    };
    
    // Add and store the mouse event listener
    document.addEventListener('mousedown', boundMousePressed);
    this.boundMousePressed = boundMousePressed;
  }
  
  /**
   * Update the scene
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime) {
    // Call base class update for transitions
    super.update(deltaTime);
    
    // Update logo animation
    this.logoScale += 0.0005 * this.logoDirection;
    if (this.logoScale > 1.05) {
      this.logoDirection = -1;
    } else if (this.logoScale < 0.95) {
      this.logoDirection = 1;
    }
    
    // Update background hue
    this.bgHue = (this.bgHue + 0.1) % 360;
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Create new particles
    if (Math.random() < 0.05) {
      this.createParticle();
    }
  }
  
  /**
   * Update background particles
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  updateParticles(deltaTime) {
    for (let i = this.bgParticles.length - 1; i >= 0; i--) {
      const particle = this.bgParticles[i];
      
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Update lifetime
      particle.life -= deltaTime;
      
      // Remove dead particles
      if (particle.life <= 0 || 
          particle.x < -50 || 
          particle.x > this.game.width + 50 || 
          particle.y < -50 || 
          particle.y > this.game.height + 50) {
        this.bgParticles.splice(i, 1);
      }
    }
  }
  
  /**
   * Create a new background particle
   */
  createParticle() {
    // Determine starting position
    let x, y;
    const side = Math.floor(Math.random() * 4);
    
    switch (side) {
      case 0: // Top
        x = Math.random() * this.game.width;
        y = -20;
        break;
      case 1: // Right
        x = this.game.width + 20;
        y = Math.random() * this.game.height;
        break;
      case 2: // Bottom
        x = Math.random() * this.game.width;
        y = this.game.height + 20;
        break;
      case 3: // Left
        x = -20;
        y = Math.random() * this.game.height;
        break;
    }
    
    // Create particle
    this.bgParticles.push({
      x,
      y,
      size: Math.random() * 5 + 2,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100,
      color: `hsla(${this.bgHue}, 100%, 70%, ${Math.random() * 0.5 + 0.2})`,
      life: Math.random() * 5 + 5
    });
  }
  
  /**
   * Draw the scene
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    console.log("MenuScene draw called");
    
    const width = this.game.width;
    const height = this.game.height;
    
    // Draw background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);
    
    // Draw background particles
    this.drawParticles(ctx);
    
    // Draw title
    this.drawTitle(ctx);
    
    // Draw menu options
    this.drawMenuOptions(ctx);
    
    // Draw version info
    this.drawVersionInfo(ctx);
  }
  
  /**
   * Draw background particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawParticles(ctx) {
    ctx.save();
    
    for (const particle of this.bgParticles) {
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  /**
   * Draw the game title
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawTitle(ctx) {
    const width = this.game.width;
    
    ctx.save();
    ctx.translate(width / 2, 120);
    ctx.scale(this.logoScale, this.logoScale);
    
    // Draw logo if available, otherwise draw text
    if (this.game.assets && this.game.assets.images && 
        this.game.assets.images.ui && this.game.assets.images.ui.logo) {
      const logo = this.game.assets.images.ui.logo;
      const logoWidth = 300;
      const logoHeight = 150;
      
      ctx.drawImage(
        logo,
        -logoWidth / 2,
        -logoHeight / 2,
        logoWidth,
        logoHeight
      );
    } else {
      ctx.fillStyle = '#FF9800';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('POTATO RACING', 0, 0);
    }
    
    ctx.restore();
    
    // Draw subtitle
    ctx.fillStyle = '#DDD';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('The Ultimate Tuber Tournament', width / 2, 180);
  }
  
  /**
   * Draw menu options
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawMenuOptions(ctx) {
    const width = this.game.width;
    const startY = 250;
    const spacing = 60;
    
    // Add roundRect polyfill if needed
    if (!ctx.roundRect) {
      ctx.roundRect = function(x, y, width, height, radius) {
        if (typeof radius === 'undefined') {
          radius = 5;
        }
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.arcTo(x + width, y, x + width, y + radius, radius);
        this.lineTo(x + width, y + height - radius);
        this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        this.lineTo(x + radius, y + height);
        this.arcTo(x, y + height, x, y + height - radius, radius);
        this.lineTo(x, y + radius);
        this.arcTo(x, y, x + radius, y, radius);
        this.closePath();
        return this;
      };
    }
    
    ctx.save();
    
    for (let i = 0; i < this.menuOptions.length; i++) {
      const option = this.menuOptions[i];
      const y = startY + i * spacing;
      const isSelected = i === this.selectedOption;
      
      // Draw button background
      if (this.game.assets && this.game.assets.images && 
          this.game.assets.images.ui && this.game.assets.images.ui.button) {
        const buttonWidth = 240;
        const buttonHeight = 50;
        
        ctx.drawImage(
          this.game.assets.images.ui.button,
          width / 2 - buttonWidth / 2,
          y - buttonHeight / 2,
          buttonWidth,
          buttonHeight
        );
      } else {
        // Draw rectangle as fallback
        ctx.fillStyle = isSelected ? '#FF9800' : '#555';
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(width / 2 - 120, y - 25, 240, 50, 10);
        ctx.fill();
        ctx.stroke();
      }
      
      // Draw button text
      ctx.fillStyle = isSelected ? '#FFF' : '#DDD';
      ctx.font = isSelected ? 'bold 20px Arial' : '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(option.text, width / 2, y);
      
      // Draw selection indicator
      if (isSelected) {
        const time = performance.now() / 1000;
        const arrowOffset = Math.sin(time * 5) * 5;
        
        ctx.fillStyle = '#FFF';
        
        // Left arrow
        ctx.beginPath();
        ctx.moveTo(width / 2 - 140 - arrowOffset, y);
        ctx.lineTo(width / 2 - 160 - arrowOffset, y - 10);
        ctx.lineTo(width / 2 - 160 - arrowOffset, y + 10);
        ctx.fill();
        
        // Right arrow
        ctx.beginPath();
        ctx.moveTo(width / 2 + 140 + arrowOffset, y);
        ctx.lineTo(width / 2 + 160 + arrowOffset, y - 10);
        ctx.lineTo(width / 2 + 160 + arrowOffset, y + 10);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }
  
  /**
   * Draw version info
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawVersionInfo(ctx) {
    const width = this.game.width;
    const height = this.game.height;
    
    ctx.fillStyle = '#999';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Version 1.0.0', width - 20, height - 20);
  }
  
  /**
   * Handle key press events
   * @param {KeyboardEvent} event - The keyboard event
   */
  keyPressed(event) {
    // If we have an event object, use it, otherwise use window.event
    const e = event || window.event;
    
    // Get the key code
    const keyCode = e ? (e.keyCode || e.which) : null;
    
    // Navigate menu with arrow keys
    if (keyCode === 38 || keyCode === 87) { // UP or W
      this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
    } else if (keyCode === 40 || keyCode === 83) { // DOWN or S
      this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
    }
    
    // Select option with enter or space
    if (keyCode === 13 || keyCode === 32) { // ENTER or SPACE
      if (this.menuOptions[this.selectedOption]) {
        this.menuOptions[this.selectedOption].action();
      }
    }
  }
  
  /**
   * Handle mouse press events
   * @param {number} x - Mouse X position
   * @param {number} y - Mouse Y position
   */
  mousePressed(x, y) {
    console.log(`Mouse pressed at (${x}, ${y})`);
    
    const width = this.game.width;
    const startY = 250;
    const spacing = 60;
    
    // Check if mouse is over a menu option
    for (let i = 0; i < this.menuOptions.length; i++) {
      const optionY = startY + i * spacing;
      
      // Always use the manual rectangle check to ensure it works
      const isInRect = (x >= width / 2 - 120 && x <= width / 2 + 120 && 
                        y >= optionY - 25 && y <= optionY + 25);
      
      console.log(`Option ${i}: ${this.menuOptions[i].text}, clicked: ${isInRect}`);
      
      if (isInRect) {
        this.selectedOption = i;
        console.log(`Selected option: ${this.menuOptions[i].text}`);
        this.menuOptions[i].action();
        return;
      }
    }
  }
  
  /**
   * Show customization screen
   */
  showCustomizationScreen() {
    console.log('Customization screen is not implemented yet.');
    // Placeholder for future implementation
    if (this.game.ui && typeof this.game.ui.setScreen === 'function') {
      // Customization screen implementation here
    }
  }
  
  /**
   * Show instructions screen
   */
  showInstructionsScreen() {
    console.log('Instructions screen is not implemented yet.');
    // Placeholder for future implementation
    if (this.game.ui && typeof this.game.ui.setScreen === 'function') {
      // Instructions screen implementation here
    }
  }
  
  /**
   * Show settings screen
   */
  showSettingsScreen() {
    console.log('Settings screen is not implemented yet.');
    // Placeholder for future implementation
    if (this.game.ui && typeof this.game.ui.setScreen === 'function') {
      // Settings screen implementation here
    }
  }
} 