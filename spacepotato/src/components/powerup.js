/**
 * powerup.js
 * Power-ups that can be collected during the race
 */

class PowerUp extends Sprite {
  /**
   * Create a new power-up
   * @param {Object} options - Power-up options
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {string} options.type - Power-up type
   */
  constructor(options) {
    // Ensure options is an object
    options = options || {};
    
    // Extract values
    const x = options.x || 0;
    const y = options.y || 0;
    const type = options.type || 'boost';
    
    // Call super constructor from Sprite
    super({
      position: { x, y },
      collider: { radius: 20 }
    });
    
    // Power-up properties
    this.type = type === 'random' ? this.getRandomType() : type;
    this.active = true;
    this.respawnTime = (CONFIG && CONFIG.POWERUPS && CONFIG.POWERUPS.RESPAWN_TIME) || 10000; // 10 seconds
    this.respawnTimer = 0;
    this.collectEffect = null;
    this.bobAmount = 5; // Pixels to move up/down
    this.bobSpeed = 2; // Bob cycle speed
    this.rotationSpeed = 1; // Rotation speed
    this.angle = 0;
    
    // Ensure position is set correctly
    this.position = { x, y };
    
    // Add tag for identification
    if (typeof this.addTag === 'function') {
      this.addTag('powerup');
      this.addTag(this.type);
    }
    
    // Set power-up specific properties
    this.setupPowerUpType();
  }
  
  /**
   * Get a random power-up type
   * @returns {string} Random power-up type
   */
  getRandomType() {
    if (CONFIG && CONFIG.POWERUPS) {
      // Get power-up types from config
      const types = Object.keys(CONFIG.POWERUPS).filter(k => 
        k !== 'RESPAWN_TIME' && typeof CONFIG.POWERUPS[k] === 'object'
      );
      
      if (types.length > 0) {
        return CONFIG.POWERUPS[types[Math.floor(Math.random() * types.length)]].id;
      }
    }
    
    // Fallback to basic types
    const basicTypes = ['boost', 'shield', 'missile', 'oil', 'repair'];
    return basicTypes[Math.floor(Math.random() * basicTypes.length)];
  }
  
  /**
   * Set properties based on power-up type
   */
  setupPowerUpType() {
    switch (this.type) {
      case 'boost':
        this.color = [50, 200, 255]; // Blue
        this.effectDuration = 3000; // 3 seconds
        this.effectStrength = 1.5; // 50% speed boost
        break;
        
      case 'shield':
        this.color = [50, 255, 100]; // Green
        this.effectDuration = 5000; // 5 seconds
        this.effectStrength = 100; // Shield health
        break;
        
      case 'missile':
        this.color = [255, 50, 50]; // Red
        this.effectDuration = 0; // Instant use
        this.effectStrength = 1; // Number of missiles
        break;
        
      case 'oil':
        this.color = [100, 50, 0]; // Brown
        this.effectDuration = 0; // Instant use
        this.effectStrength = 1; // Number of oil slicks
        break;
        
      case 'repair':
        this.color = [255, 200, 50]; // Yellow
        this.effectDuration = 0; // Instant use
        this.effectStrength = 30; // Health to restore
        break;
        
      default:
        this.color = [200, 200, 200]; // Gray for unknown types
        this.effectDuration = 3000;
        this.effectStrength = 1;
    }
  }
  
  /**
   * Update the power-up
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.active) {
      // Handle respawn
      this.respawnTimer += deltaTime * 1000;
      if (this.respawnTimer >= this.respawnTime) {
        this.active = true;
        this.respawnTimer = 0;
      }
      return;
    }
    
    // Animate power-up
    this.animate(deltaTime);
  }
  
  /**
   * Animate the power-up
   * @param {number} deltaTime - Time since last frame in seconds
   */
  animate(deltaTime) {
    // Update rotation
    this.angle = (this.angle || 0) + (this.rotationSpeed || 1) * deltaTime;
    
    // Bob up and down
    if (!this.bobStartTime) {
      this.bobStartTime = Date.now();
    }
    
    const bobAmount = this.bobAmount || 5;
    const bobSpeed = this.bobSpeed || 2;
    const time = (Date.now() - this.bobStartTime) / 1000;
    
    // Calculate bob offset
    this.bobOffset = Math.sin(time * bobSpeed) * bobAmount;
    
    // Apply to position
    if (this.originalY === undefined) {
      this.originalY = this.position.y;
    }
    
    this.position.y = this.originalY + this.bobOffset;
  }
  
  /**
   * Collect the power-up
   * @param {Potato} potato - The potato that collected the power-up
   * @returns {Object} Power-up effect data
   */
  collect(potato) {
    if (!this.active) return null;
    
    // Deactivate power-up
    this.active = false;
    
    // Create collection effect
    this.createCollectEffect();
    
    // Add the power-up to the potato if possible
    try {
      if (potato && typeof potato.addPowerup === 'function') {
        potato.addPowerup(this.type);
      } else if (potato && potato.activePowerups && Array.isArray(potato.activePowerups)) {
        // Fallback if addPowerup doesn't exist but we can access activePowerups directly
        potato.activePowerups.push({
          type: this.type,
          timeRemaining: this.effectDuration,
          strength: this.effectStrength
        });
      }
    } catch (err) {
      console.error("Error adding powerup to potato:", err);
    }
    
    // Set respawn timer
    this.respawnTimer = 0;
    
    // Return power-up data for visual effects in the scene
    return {
      type: this.type,
      duration: this.effectDuration,
      strength: this.effectStrength,
      color: Array.isArray(this.color) ? 
        `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})` : 
        (this.color || '#FFFFFF')
    };
  }
  
  /**
   * Create a visual effect when collected
   */
  createCollectEffect() {
    // Create particle burst effect
    if (ParticleSystem) {
      ParticleSystem.createBurst({
        x: this.position.x,
        y: this.position.y,
        count: 10,
        color: this.color,
        size: { min: 5, max: 10 },
        speed: { min: 50, max: 100 },
        lifetime: { min: 0.5, max: 1 }
      });
    }
  }
  
  /**
   * Draw the power-up
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera for transform (optional)
   */
  draw(ctx, camera) {
    try {
      if (!this.active) return;
      
      // Save context state
      ctx.save();
      
      // Apply camera transform if available
      if (camera && typeof camera.worldToScreen === 'function' && this.position && this.position.x !== undefined && this.position.y !== undefined) {
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        ctx.translate(screenPos.x, screenPos.y);
        if (camera.zoom) {
          ctx.scale(camera.zoom, camera.zoom);
        }
      } else if (camera && camera.position && this.position && this.position.x !== undefined && this.position.y !== undefined) {
        // Manual camera transform (fallback)
        ctx.translate(
          this.position.x - camera.position.x,
          this.position.y - camera.position.y
        );
        if (camera.zoom) {
          ctx.scale(camera.zoom, camera.zoom);
        }
      } else if (this.position && this.position.x !== undefined && this.position.y !== undefined) {
        // No camera, just use world coordinates
        ctx.translate(this.position.x, this.position.y);
      } else if (this.x !== undefined && this.y !== undefined) {
        // Fallback to x, y if position is not defined
        ctx.translate(this.x, this.y);
      } else {
        // Can't draw if no position available
        console.warn('PowerUp has no position to draw');
        ctx.restore();
        return;
      }
      
      // Apply rotation
      const angle = this.angle || 0;
      ctx.rotate(angle);
      
      // Draw power-up
      
      // Glow effect
      const color = this.color || [200, 200, 200];
      for (let i = 3; i > 0; i--) {
        const alpha = (50 - i * 15) / 255;
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.collider.radius + i * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Main body
      ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.beginPath();
      ctx.arc(0, 0, this.collider.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon based on type
      ctx.fillStyle = '#FFFFFF';
      switch (this.type) {
        case 'boost':
          // Draw lightning bolt
          ctx.beginPath();
          ctx.moveTo(-5, -10);
          ctx.lineTo(0, 0);
          ctx.lineTo(-5, 0);
          ctx.lineTo(5, 10);
          ctx.lineTo(0, 0);
          ctx.lineTo(5, 0);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'shield':
          // Draw shield
          ctx.beginPath();
          ctx.arc(0, 0, this.collider.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, this.collider.radius * 0.8, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case 'missile':
          // Draw missile
          ctx.fillRect(-2, -10, 4, 20);
          ctx.beginPath();
          ctx.moveTo(-5, -10);
          ctx.lineTo(5, -10);
          ctx.lineTo(0, -15);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'oil':
          // Draw oil slick
          ctx.beginPath();
          ctx.arc(-5, -5, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(5, -3, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 5, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'repair':
          // Draw wrench
          ctx.beginPath();
          ctx.moveTo(-8, -8);
          ctx.lineTo(-5, -5);
          ctx.lineTo(3, 3);
          ctx.lineTo(5, 0);
          ctx.lineTo(8, 3);
          ctx.lineTo(5, 6);
          ctx.lineTo(2, 3);
          ctx.lineTo(-6, -3);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      // Restore context
      ctx.restore();
      
      // Draw debug info
      if (window.CONFIG && CONFIG.DEBUG && CONFIG.DEBUG.SHOW_COLLIDERS) {
        ctx.save();
        
        const pos = this.position || { x: this.x, y: this.y };
        if (!pos || pos.x === undefined || pos.y === undefined) {
          ctx.restore();
          return;
        }
        
        if (camera && typeof camera.worldToScreen === 'function') {
          const screenPos = camera.worldToScreen(pos.x, pos.y);
          ctx.translate(screenPos.x, screenPos.y);
        } else if (camera && camera.position) {
          ctx.translate(pos.x - camera.position.x, pos.y - camera.position.y);
        } else {
          ctx.translate(pos.x, pos.y);
        }
        
        ctx.strokeStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(0, 0, this.collider.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
      }
    } catch (e) {
      console.error("Error drawing powerup:", e);
      // Restore context in case of error
      ctx.restore();
    }
  }
} 