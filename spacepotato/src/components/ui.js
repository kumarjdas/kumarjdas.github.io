/**
 * ui.js
 * UI components for the racing game
 */

class UI {
  /**
   * Create a new UI
   * @param {Object} options - UI options
   */
  constructor(options = {}) {
    // Canvas dimensions
    this.width = options.width || 800;
    this.height = options.height || 600;
    
    // UI elements
    this.elements = [];
    
    // Default styles
    this.defaultStyles = {
      font: 'Arial',
      fontSize: 16,
      textColor: [255, 255, 255],
      backgroundColor: [0, 0, 0, 100],
      borderColor: [255, 255, 255],
      borderWidth: 2,
      padding: 10,
      cornerRadius: 5
    };
    
    // Game state
    this.gameState = {
      raceActive: false,
      countdownTime: 0,
      currentLap: 0,
      maxLaps: 3,
      position: 1,
      totalPlayers: 1,
      speed: 0,
      time: 0,
      lapTimes: [],
      bestLapTime: 0
    };
    
    // Create default UI elements
    this.createDefaultElements();
  }
  
  /**
   * Create default UI elements
   */
  createDefaultElements() {
    // Countdown display
    this.addElement({
      id: 'countdown',
      type: 'text',
      x: this.width / 2,
      y: this.height / 3,
      width: 'auto',
      height: 'auto',
      text: '',
      fontSize: 72,
      textAlign: 'center',
      textBaseline: 'middle',
      visible: false,
      update: (el, state) => {
        el.visible = state.countdownTime > 0;
        
        if (state.countdownTime <= 0) {
          el.text = '';
        } else if (state.countdownTime <= 1) {
          el.text = 'GO!';
          el.textColor = [0, 255, 0];
        } else {
          el.text = Math.ceil(state.countdownTime);
          el.textColor = [255, 0, 0];
        }
      }
    });
    
    // Lap counter
    this.addElement({
      id: 'lapCounter',
      type: 'text',
      x: 20,
      y: 20,
      width: 150,
      height: 40,
      padding: 10,
      text: 'LAP: 0/3',
      textAlign: 'left',
      backgroundColor: [0, 0, 0, 150],
      borderColor: [255, 255, 255],
      update: (el, state) => {
        el.text = `LAP: ${state.currentLap}/${state.maxLaps}`;
      }
    });
    
    // Position indicator
    this.addElement({
      id: 'position',
      type: 'text',
      x: 190,
      y: 20,
      width: 150,
      height: 40,
      padding: 10,
      text: 'POS: 1/1',
      textAlign: 'left',
      backgroundColor: [0, 0, 0, 150],
      borderColor: [255, 255, 255],
      update: (el, state) => {
        el.text = `POS: ${state.position}/${state.totalPlayers}`;
      }
    });
    
    // Speed display
    this.addElement({
      id: 'speed',
      type: 'text',
      x: this.width - 170,
      y: 20,
      width: 150,
      height: 40,
      padding: 10,
      text: '0 KM/H',
      textAlign: 'right',
      backgroundColor: [0, 0, 0, 150],
      borderColor: [255, 255, 255],
      update: (el, state) => {
        const speedKMH = Math.round(state.speed * 3.6); // Convert m/s to km/h
        el.text = `${speedKMH} KM/H`;
        
        // Change color based on speed
        if (speedKMH > 120) {
          el.textColor = [255, 0, 0];
        } else if (speedKMH > 80) {
          el.textColor = [255, 255, 0];
        } else {
          el.textColor = [255, 255, 255];
        }
      }
    });
    
    // Race timer
    this.addElement({
      id: 'timer',
      type: 'text',
      x: this.width / 2,
      y: 20,
      width: 150,
      height: 40,
      padding: 10,
      text: '00:00.000',
      textAlign: 'center',
      backgroundColor: [0, 0, 0, 150],
      borderColor: [255, 255, 255],
      update: (el, state) => {
        if (!state.raceActive) return;
        
        el.text = this.formatTime(state.time);
      }
    });
    
    // Lap times panel
    this.addElement({
      id: 'lapTimes',
      type: 'panel',
      x: this.width - 170,
      y: 80,
      width: 150,
      height: 'auto',
      padding: 10,
      backgroundColor: [0, 0, 0, 150],
      borderColor: [255, 255, 255],
      children: [],
      visible: true,
      update: (el, state) => {
        // Clear existing children
        el.children = [];
        
        // Add header
        el.children.push({
          type: 'text',
          text: 'LAP TIMES',
          textAlign: 'center',
          fontSize: 14,
          y: 5,
          height: 20
        });
        
        // Add best lap time
        if (state.bestLapTime > 0) {
          el.children.push({
            type: 'text',
            text: `BEST: ${this.formatTime(state.bestLapTime)}`,
            textAlign: 'left',
            fontSize: 12,
            textColor: [255, 255, 0],
            y: 25,
            height: 20
          });
        }
        
        // Add lap times
        for (let i = 0; i < state.lapTimes.length; i++) {
          el.children.push({
            type: 'text',
            text: `${i + 1}: ${this.formatTime(state.lapTimes[i])}`,
            textAlign: 'left',
            fontSize: 12,
            y: 45 + i * 20,
            height: 20
          });
        }
        
        // Adjust panel height
        const contentHeight = 45 + state.lapTimes.length * 20;
        el.height = Math.max(60, contentHeight);
      }
    });
    
    // Power-up indicator
    this.addElement({
      id: 'powerup',
      type: 'powerup',
      x: 20,
      y: this.height - 80,
      width: 60,
      height: 60,
      powerUpType: null,
      backgroundColor: [0, 0, 0, 150],
      borderColor: [255, 255, 255],
      visible: false,
      durationLeft: 0,
      maxDuration: 0,
      update: (el, state) => {
        el.visible = state.powerUpType !== null;
        el.powerUpType = state.powerUpType;
        el.durationLeft = state.powerUpDuration;
        el.maxDuration = state.powerUpMaxDuration;
      }
    });
  }
  
  /**
   * Format time in mm:ss.ms format
   * @param {number} timeMs - Time in milliseconds
   * @returns {string} Formatted time
   */
  formatTime(timeMs) {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  
  /**
   * Add a new UI element
   * @param {Object} element - Element configuration
   */
  addElement(element) {
    // Apply default styles
    const mergedElement = {
      ...this.defaultStyles,
      ...element,
      id: element.id || `element-${this.elements.length}`
    };
    
    this.elements.push(mergedElement);
    return mergedElement;
  }
  
  /**
   * Get a UI element by id
   * @param {string} id - Element id
   * @returns {Object} UI element
   */
  getElement(id) {
    return this.elements.find(el => el.id === id);
  }
  
  /**
   * Remove a UI element
   * @param {string} id - Element id
   */
  removeElement(id) {
    const index = this.elements.findIndex(el => el.id === id);
    if (index !== -1) {
      this.elements.splice(index, 1);
    }
  }
  
  /**
   * Update UI based on game state
   * @param {Object} gameState - Current game state
   */
  update(gameState = {}) {
    // Update game state
    this.gameState = {
      ...this.gameState,
      ...gameState
    };
    
    // Update all elements
    for (const element of this.elements) {
      if (element.update) {
        element.update(element, this.gameState);
      }
    }
  }
  
  /**
   * Draw the UI
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  draw(ctx) {
    try {
      // Save context state
      ctx.save();
      
      // Draw each element
      for (const element of this.elements) {
        if (element.visible === false) continue;
        
        this.drawElement(ctx, element);
      }
      
      // Restore context state
      ctx.restore();
    } catch (err) {
      console.error("Error drawing UI:", err);
      ctx.restore();
    }
  }
  
  /**
   * Draw a single UI element
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} element - UI element to draw
   */
  drawElement(ctx, element) {
    try {
      // Save context state
      ctx.save();
      
      // Set translation
      ctx.translate(element.x, element.y);
      
      // Draw background
      if (element.backgroundColor) {
        // Set fill style
        const bg = element.backgroundColor;
        const alpha = bg.length > 3 ? bg[3] / 255 : 1;
        ctx.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${alpha})`;
        
        if (element.borderColor) {
          const border = element.borderColor;
          const borderAlpha = border.length > 3 ? border[3] / 255 : 1;
          ctx.strokeStyle = `rgba(${border[0]}, ${border[1]}, ${border[2]}, ${borderAlpha})`;
          ctx.lineWidth = element.borderWidth || 1;
        } else {
          ctx.strokeStyle = 'transparent';
        }
        
        // Draw based on element type
        switch (element.type) {
          case 'circle':
            const diameter = Math.max(element.width, element.height);
            ctx.beginPath();
            ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
            ctx.fill();
            if (element.borderColor) ctx.stroke();
            break;
            
          case 'powerup':
            // Draw power-up background
            this.drawRoundedRect(ctx, 0, 0, element.width, element.height, element.cornerRadius || 5);
            
            // Draw power-up icon
            if (element.powerUpType) {
              this.drawPowerUpIcon(ctx, element);
            }
            
            // Draw duration bar
            if (element.durationLeft > 0 && element.maxDuration > 0) {
              const progress = element.durationLeft / element.maxDuration;
              ctx.fillStyle = 'rgb(0, 255, 0)';
              this.drawRoundedRect(
                ctx,
                0, 
                element.height - 5, 
                element.width * progress, 
                5, 
                0
              );
            }
            break;
            
          case 'panel':
            this.drawRoundedRect(ctx, 0, 0, element.width, element.height, element.cornerRadius || 5);
            
            // Draw children
            if (element.children) {
              for (const child of element.children) {
                this.drawElement(ctx, {
                  ...this.defaultStyles,
                  ...child,
                  x: child.x || element.padding || 0,
                  width: child.width || element.width - (element.padding * 2)
                });
              }
            }
            break;
            
          default:
            // Set text properties to measure text width if needed
            if (element.text !== undefined) {
              ctx.font = `${element.fontSize || 16}px ${element.font || 'Arial'}`;
            }
            
            // Default rectangle
            const width = element.width === 'auto' ? ctx.measureText(element.text).width + (element.padding * 2) : element.width;
            const height = element.height === 'auto' ? (element.fontSize * 1.5) : element.height;
            this.drawRoundedRect(ctx, 0, 0, width, height, element.cornerRadius || 5);
            
            // Draw text if present
            if (element.text !== undefined) {
              const textColor = element.textColor || [255, 255, 255];
              ctx.fillStyle = `rgb(${textColor[0]}, ${textColor[1]}, ${textColor[2]})`;
              ctx.font = `${element.fontSize || 16}px ${element.font || 'Arial'}`;
              
              // Set text alignment
              let textX = element.padding || 0;
              const textY = height / 2;
              
              if (element.textAlign === 'center') {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                textX = width / 2;
              } else if (element.textAlign === 'right') {
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                textX = width - element.padding;
              } else {
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
              }
              
              ctx.fillText(element.text, textX, textY);
            }
        }
      }
      
      // Restore context state
      ctx.restore();
    } catch (err) {
      console.error("Error drawing UI element:", err);
      ctx.restore();
    }
  }
  
  /**
   * Draw a rounded rectangle
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (radius === 0) {
      ctx.fillRect(x, y, width, height);
      if (ctx.strokeStyle !== 'transparent') {
        ctx.strokeRect(x, y, width, height);
      }
      return;
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
    
    ctx.fill();
    if (ctx.strokeStyle !== 'transparent') {
      ctx.stroke();
    }
  }
  
  /**
   * Draw power-up icon
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} element - PowerUp element
   */
  drawPowerUpIcon(ctx, element) {
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    const size = Math.min(element.width, element.height) * 0.6;
    
    // Save context state
    ctx.save();
    
    // Translate to center
    ctx.translate(centerX, centerY);
    
    switch (element.powerUpType) {
      case 'boost':
        // Draw lightning bolt
        ctx.fillStyle = 'rgb(50, 200, 255)';
        ctx.beginPath();
        ctx.moveTo(-size/3, -size/2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-size/4, 0);
        ctx.lineTo(size/3, size/2);
        ctx.lineTo(0, 0);
        ctx.lineTo(size/4, 0);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'shield':
        // Draw shield
        ctx.fillStyle = 'rgb(50, 255, 100)';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'missile':
        // Draw missile
        ctx.fillStyle = 'rgb(255, 50, 50)';
        ctx.fillRect(-size/8, -size/2, size/4, size);
        
        ctx.beginPath();
        ctx.moveTo(-size/4, -size/2);
        ctx.lineTo(size/4, -size/2);
        ctx.lineTo(0, -size*0.7);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'oil':
        // Draw oil slick
        ctx.fillStyle = 'rgb(100, 50, 0)';
        
        ctx.beginPath();
        ctx.arc(-size/4, -size/4, size/6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(size/4, -size/6, size/5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(0, size/4, size/4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'repair':
        // Draw wrench
        ctx.fillStyle = 'rgb(255, 200, 50)';
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/2);
        ctx.lineTo(-size/4, -size/4);
        ctx.lineTo(size/4, size/4);
        ctx.lineTo(size/3, 0);
        ctx.lineTo(size/2, size/4);
        ctx.lineTo(size/4, size/2);
        ctx.lineTo(0, size/4);
        ctx.lineTo(-size/3, -size/6);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    // Restore context state
    ctx.restore();
  }
  
  /**
   * Handle window resize
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    const scaleX = width / this.width;
    const scaleY = height / this.height;
    
    this.width = width;
    this.height = height;
    
    // Reposition elements
    for (const element of this.elements) {
      // Only scale elements that aren't anchored to corners
      if (element.id === 'countdown') {
        element.x = width / 2;
        element.y = height / 3;
      } else if (element.x > this.width / 2) {
        // Right-aligned elements
        element.x = width - (this.width - element.x);
      }
      
      if (element.y > this.height / 2) {
        // Bottom-aligned elements
        element.y = height - (this.height - element.y);
      }
    }
    
    // Update powerup position
    const powerup = this.getElement('powerup');
    if (powerup) {
      powerup.y = height - 80;
    }
  }
  
  /**
   * Show a notification
   * @param {string} message - Notification message
   * @param {number} duration - Display duration in milliseconds
   * @param {Array} color - Text color
   */
  showNotification(message, duration = 3000, color = [255, 255, 255]) {
    // Remove existing notification
    this.removeElement('notification');
    
    // Create new notification
    const notification = this.addElement({
      id: 'notification',
      type: 'text',
      x: this.width / 2,
      y: this.height / 4,
      width: 'auto',
      height: 'auto',
      text: message,
      fontSize: 24,
      textAlign: 'center',
      textColor: color,
      backgroundColor: [0, 0, 0, 180],
      padding: 15,
      visible: true
    });
    
    // Hide notification after duration
    setTimeout(() => {
      this.removeElement('notification');
    }, duration);
  }
  
  /**
   * Show the countdown animation
   * @param {Function} onComplete - Callback when countdown completes
   */
  showCountdown(onComplete) {
    const countdownElement = this.getElement('countdown');
    if (!countdownElement) return;
    
    // Show countdown element
    countdownElement.visible = true;
    
    // Set initial countdown time
    this.gameState.countdownTime = 3;
    
    // Update countdown every 10ms for smooth animation
    const interval = setInterval(() => {
      this.gameState.countdownTime -= 0.01;
      
      // Update UI
      this.update();
      
      // Check if countdown is complete
      if (this.gameState.countdownTime <= -1) {
        clearInterval(interval);
        countdownElement.visible = false;
        
        if (onComplete) {
          onComplete();
        }
      }
    }, 10);
  }
} 