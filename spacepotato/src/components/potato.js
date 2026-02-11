/**
 * potato.js
 * Potato character for the racing game
 */

class Potato extends Sprite {
  /**
   * Create a new potato player
   * @param {Object} options - Potato options
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {string} options.type - Potato type
   * @param {number} options.playerNumber - Player number
   * @param {boolean} options.isPlayer - Whether this is a human player
   * @param {string} options.difficulty - AI difficulty
   */
  constructor(options) {
    // Ensure options exist
    options = options || {};
    
    // Extract basic properties
    const x = options.x || 0;
    const y = options.y || 0;
    const type = options.type || 'RUSSET';
    const playerNumber = options.playerNumber || 1;
    const isPlayer = options.isPlayer !== undefined ? options.isPlayer : true;
    const difficulty = options.difficulty || 'MEDIUM';
    
    // Call parent constructor with position
    super({
      position: { x, y },
      collider: { radius: 25 },
      tag: 'potato'
    });
    
    // Check if CONFIG.POTATO_TYPES exists
    if (!window.CONFIG || !CONFIG.POTATO_TYPES) {
      console.warn("CONFIG.POTATO_TYPES not found, using default values");
      
      // Create default potato types if missing
      if (!window.CONFIG) window.CONFIG = {};
      if (!CONFIG.POTATO_TYPES) {
        CONFIG.POTATO_TYPES = {
          RUSSET: {
            name: 'Russet',
            color: '#A0522D',
            topSpeed: 5,
            acceleration: 0.2,
            handling: 1.0,
            weight: 1.0
          },
          RED: {
            name: 'Red',
            color: '#8B0000',
            topSpeed: 4.5,
            acceleration: 0.25,
            handling: 1.2,
            weight: 0.9
          },
          SWEET: {
            name: 'Sweet',
            color: '#FF8C00',
            topSpeed: 4.8,
            acceleration: 0.22,
            handling: 1.1,
            weight: 0.95
          },
          PURPLE: {
            name: 'Purple',
            color: '#800080',
            topSpeed: 5.2,
            acceleration: 0.18,
            handling: 0.9,
            weight: 1.1
          }
        };
      }
    }
    
    // Get potato type properties from config or use defaults
    const potatoType = 
      (CONFIG && CONFIG.POTATO_TYPES && CONFIG.POTATO_TYPES[type]) || 
      (CONFIG && CONFIG.POTATO_TYPES && CONFIG.POTATO_TYPES.RUSSET) || 
      {
        name: 'Russet',
        color: '#A0522D',
        topSpeed: 5,
        acceleration: 0.2,
        handling: 1.0,
        weight: 1.0
      };
    
    // Potato properties
    this.type = type;
    this.playerNumber = playerNumber;
    this.isPlayer = isPlayer;
    this.difficulty = difficulty;
    
    // Stats based on type
    this.topSpeed = potatoType.topSpeed || 5;
    this.acceleration = potatoType.acceleration || 0.2;
    this.handling = potatoType.handling || 1.0;
    this.weight = potatoType.weight || 1.0;
    
    // Visual properties
    this.color = potatoType.color || '#A0522D';
    this.width = 40;
    this.height = 60;
    this.collider.radius = 25;
    
    // Movement state
    this.input = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      powerup: false
    };
    
    // Race state
    this.checkpoint = 0;
    this.lap = 0;
    this.position = { x: x, y: y };
    this.velocity = { x: 0, y: 0 };
    this.speed = 0;
    this.direction = 0;
    this.friction = 0.05;
    this.health = 100;
    this.racePosition = playerNumber;
    this.finished = false;
    this.finishTime = 0;
    
    // Power-ups
    this.activePowerups = [];
    this.isShielded = false;
    this.currentPowerup = null;
    
    // Visual effects
    this.skidMarks = [];
    this.damageEffects = [];
    this.customization = options.customization || {
      hatType: 'default',
      wheelColor: '#333333',
      eyes: 'default'
    };
    
    // Animation properties
    this.hatPosition = { x: 0, y: -15 };
    this.hatRotation = 0;
    this.eyeRotation = 0;
    
    // Add tag for identification
    this.addTag('potato');
    this.addTag(`player${playerNumber}`);
  }
  
  /**
   * Update the potato
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {Object} track - Track object
   * @param {Array} otherPotatoes - Other potatoes for collision detection
   */
  update(deltaTime, track, otherPotatoes) {
    if (!this.active) return;
    
    // Update lap time
    if (!this.finished) {
      this.currentLapTime = Date.now() - this.lapStartTime;
    }
    
    // Calculate terrain effects if track is provided
    if (track) {
      this.updateTerrainEffects(track);
    }
    
    // Apply player controls
    this.handleControls(deltaTime);
    
    // Apply physics (parent method)
    super.update(deltaTime);
    
    // Apply top speed limit based on potato type and power-ups
    this.limitSpeed();
    
    // Check for collisions with track boundaries
    if (track) {
      this.checkTrackBoundaries(track);
      this.updateRaceProgress(track);
    }
    
    // Check for collisions with other potatoes
    if (otherPotatoes) {
      this.checkPotatoCollisions(otherPotatoes);
    }
    
    // Update power-ups
    this.updatePowerups(deltaTime);
    
    // Regenerate health slowly
    this.regenerateHealth(deltaTime);
    
    // Update animation effects
    this.updateAnimationEffects(deltaTime);
  }
  
  /**
   * Calculate the effects of the current terrain
   */
  updateTerrainEffects(track) {
    // Check if track and position exist
    if (!track || typeof track.getTerrainAt !== 'function' || !this.position || 
        this.position.x === undefined || this.position.y === undefined) {
      // Default terrain effects if we can't get terrain
      this.currentTerrain = this.currentTerrain || CONFIG.TERRAIN.ASPHALT || { friction: 0.1, grip: 1.0 };
      this.friction = (this.currentTerrain.friction || 0.1) + (CONFIG.PHYSICS ? CONFIG.PHYSICS.BASE_FRICTION || 0.05 : 0.05);
      return;
    }
    
    try {
      // Determine terrain at current position
      this.currentTerrain = track.getTerrainAt(this.position.x, this.position.y);
      
      // Update friction based on terrain
      if (this.currentTerrain) {
        this.friction = (this.currentTerrain.friction || 0.1) + 
                       (CONFIG.PHYSICS ? CONFIG.PHYSICS.BASE_FRICTION || 0.05 : 0.05);
      } else {
        // Default friction if terrain is undefined
        this.friction = 0.15;
      }
    } catch (e) {
      console.error("Error in updateTerrainEffects:", e);
      // Default friction in case of error
      this.friction = 0.15;
    }
  }
  
  /**
   * Handle player input
   */
  handleControls(deltaTime) {
    try {
      // Initialize Input if not already done
      if (window.Input && typeof Input.init === 'function' && !Input.initialized) {
        Input.init();
      }
      
      // Get player input state, fallback to empty state if Input not available
      const controlState = (window.Input && typeof Input.getPlayerControls === 'function') ? 
        Input.getPlayerControls(this.playerNumber - 1) : 
        { up: false, down: false, left: false, right: false, action: false };
      
      // Calculate acceleration multiplier based on terrain and power-ups
      let accelerationMultiplier = 1;
      
      // Apply power-up effects
      if (this.activePowerups && Array.isArray(this.activePowerups)) {
        for (const powerup of this.activePowerups) {
          // Safely check for boost powerup
          if (powerup && powerup.type && 
              window.CONFIG && CONFIG.POWERUPS && CONFIG.POWERUPS.SPEED_BOOST && 
              powerup.type === CONFIG.POWERUPS.SPEED_BOOST.id) {
            accelerationMultiplier *= 1.5;
          }
        }
      }
      
      // Apply terrain effects
      if (this.currentTerrain) {
        accelerationMultiplier *= (1 - (this.currentTerrain.friction || 0) * 0.5);
      }
      
      // Apply catch-up mechanics (boost when behind)
      if (this.racePosition > 1 && !this.finished) {
        // Get catchup factor from config or use a default value
        const catchupFactor = (window.CONFIG && CONFIG.BALANCE && CONFIG.BALANCE.CATCHUP_FACTOR) || 0.05;
        const boostFactor = 1 + ((this.racePosition - 1) * catchupFactor);
        accelerationMultiplier *= boostFactor;
      }
      
      // Calculate forward/backward acceleration
      if (controlState.up) {
        // Forward acceleration
        const direction = this.getDirection();
        
        if (direction && typeof direction === 'object' && 
            direction.x !== undefined && direction.y !== undefined) {
          const accelForceX = direction.x * this.acceleration * accelerationMultiplier;
          const accelForceY = direction.y * this.acceleration * accelerationMultiplier;
          
          this.applyForce(accelForceX, accelForceY);
        }
      } else if (controlState.down) {
        // Braking/reverse
        const direction = this.getDirection();
        
        if (direction && typeof direction === 'object' && 
            direction.x !== undefined && direction.y !== undefined) {
          const brakeForceX = -direction.x * this.acceleration * 0.5;
          const brakeForceY = -direction.y * this.acceleration * 0.5;
          
          this.applyForce(brakeForceX, brakeForceY);
        }
      }
      
      // Calculate steering
      // Get rotation speed from config or use default
      const baseRotationSpeed = (window.CONFIG && CONFIG.PHYSICS && CONFIG.PHYSICS.ROTATION_SPEED) || 0.1;
      const turnRate = baseRotationSpeed * (this.handling || 1.0);
      
      // Apply terrain grip effect
      let gripFactor = 1;
      if (this.currentTerrain && this.currentTerrain.grip !== undefined) {
        gripFactor = this.currentTerrain.grip;
      }
      
      // Calculate turn amount based on speed
      let speed = 0;
      
      if (window.Physics && typeof Physics.getSpeed === 'function') {
        speed = Physics.getSpeed(this);
      } else if (this.speed !== undefined) {
        speed = this.speed;
      } else if (this.velocity && this.velocity.x !== undefined && this.velocity.y !== undefined) {
        speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
      }
      
      // Helper function for clamping if not available
      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
      
      const speedFactor = (window.Helpers && typeof Helpers.clamp === 'function') ? 
        Helpers.clamp(speed / (this.topSpeed || 5), 0.3, 1.0) : 
        clamp(speed / (this.topSpeed || 5), 0.3, 1.0);
      
      const effectiveTurnRate = turnRate * gripFactor * speedFactor;
      
      if (controlState.left && this.rotation !== undefined) {
        this.rotation -= effectiveTurnRate * deltaTime * 60; // Scale by 60 to make frame rate independent
      }
      
      if (controlState.right && this.rotation !== undefined) {
        this.rotation += effectiveTurnRate * deltaTime * 60;
      }
      
      // Handle action button (use power-up, etc.)
      if (controlState.action) {
        if (typeof this.useActivePowerup === 'function') {
          this.useActivePowerup();
        }
      }
    } catch (err) {
      console.error("Error in handleControls:", err);
    }
  }
  
  /**
   * Limit the potato's speed based on top speed and effects
   */
  limitSpeed() {
    // Calculate effective top speed
    let effectiveTopSpeed = this.topSpeed;
    
    // Apply power-up effects
    for (const powerup of this.activePowerups) {
      if (powerup.type === CONFIG.POWERUPS.SPEED_BOOST.id) {
        effectiveTopSpeed *= 1.3;
      } else if (powerup.type === CONFIG.POWERUPS.SIZE_REDUCTION.id) {
        effectiveTopSpeed *= 1.1;
      }
    }
    
    // Apply terrain effects
    if (this.currentTerrain && this.currentTerrain.id === 'mud') {
      effectiveTopSpeed *= 0.7;
    }
    
    // Limit to top speed
    Physics.limitSpeed(this, effectiveTopSpeed);
  }
  
  /**
   * Check for collisions with track boundaries
   */
  checkTrackBoundaries(track) {
    const collision = track.checkBoundaryCollision(this);
    
    if (collision.colliding) {
      // Move outside the boundary
      this.position.x += collision.normal.x * collision.overlap;
      this.position.y += collision.normal.y * collision.overlap;
      
      // Calculate bounce effect
      const dotProduct = 
        this.velocity.x * collision.normal.x + 
        this.velocity.y * collision.normal.y;
      
      // Only apply bounce if moving toward the boundary
      if (dotProduct < 0) {
        // Reflect velocity
        this.velocity.x -= 2 * dotProduct * collision.normal.x * CONFIG.PHYSICS.BOUNCE_FACTOR;
        this.velocity.y -= 2 * dotProduct * collision.normal.y * CONFIG.PHYSICS.BOUNCE_FACTOR;
        
        // Reduce velocity (energy loss from collision)
        this.velocity.x *= 0.8;
        this.velocity.y *= 0.8;
        
        // Flag as colliding
        this.isColliding = true;
        
        // Apply damage if not shielded
        if (!this.isShielded) {
          this.applyDamage(5);
        }
      }
    } else {
      // Reset collision flag
      this.isColliding = false;
    }
  }
  
  /**
   * Check for collisions with other potatoes
   */
  checkPotatoCollisions(otherPotatoes) {
    if (!otherPotatoes || !Array.isArray(otherPotatoes)) return;
    
    for (const otherPotato of otherPotatoes) {
      try {
        // Skip self
        if (otherPotato === this) continue;
        
        // Skip inactive potatoes
        if (otherPotato.active === false) continue;
        
        // Skip if either potato is missing required properties
        if (!this.position || !otherPotato.position) continue;
        
        // Skip collisions if either has ghost power-up
        const thisHasGhost = this.activePowerups && this.activePowerups.some && 
          this.activePowerups.some(p => p && p.type === (CONFIG && CONFIG.POWERUPS && CONFIG.POWERUPS.GHOST && CONFIG.POWERUPS.GHOST.id));
          
        const otherHasGhost = otherPotato.activePowerups && otherPotato.activePowerups.some && 
          otherPotato.activePowerups.some(p => p && p.type === (CONFIG && CONFIG.POWERUPS && CONFIG.POWERUPS.GHOST && CONFIG.POWERUPS.GHOST.id));
        
        if (thisHasGhost || otherHasGhost) continue;
        
        // Check for collision
        const collision = this.checkCollision(otherPotato);
        
        if (collision) {
          // Resolve collision
          if (typeof Physics === 'object' && typeof Physics.resolveCollision === 'function') {
            Physics.resolveCollision(this, otherPotato, collision);
          } else {
            // Simple collision response if physics module not available
            if (this.velocity && otherPotato.velocity) {
              // Basic bounce by reversing velocities
              const tempVelX = this.velocity.x;
              const tempVelY = this.velocity.y;
              
              this.velocity.x = -tempVelX * 0.8;
              this.velocity.y = -tempVelY * 0.8;
              
              if (typeof otherPotato.velocity === 'object') {
                otherPotato.velocity.x = tempVelX * 0.8;
                otherPotato.velocity.y = tempVelY * 0.8;
              }
            }
          }
          
          // Calculate impact speed
          let relativeSpeed = 1;
          
          if (typeof Physics === 'object' && typeof Physics.getSpeed === 'function') {
            const thisSpeed = Physics.getSpeed(this);
            const otherSpeed = Physics.getSpeed(otherPotato);
            relativeSpeed = Math.abs(thisSpeed - otherSpeed);
          } else if (this.speed !== undefined && otherPotato.speed !== undefined) {
            relativeSpeed = Math.abs(this.speed - otherPotato.speed);
          }
          
          // Apply damage based on relative speed
          if (!this.isShielded && relativeSpeed > 1) {
            const damageFactor = (CONFIG && CONFIG.PHYSICS && CONFIG.PHYSICS.COLLISION_DAMAGE) || 5;
            this.applyDamage(damageFactor * relativeSpeed / (this.topSpeed || 5));
          }
          
          if (!otherPotato.isShielded && relativeSpeed > 1 && typeof otherPotato.applyDamage === 'function') {
            const damageFactor = (CONFIG && CONFIG.PHYSICS && CONFIG.PHYSICS.COLLISION_DAMAGE) || 5;
            otherPotato.applyDamage(damageFactor * relativeSpeed / (otherPotato.topSpeed || 5));
          }
        }
      } catch (err) {
        console.error("Error checking potato collision:", err);
      }
    }
  }
  
  /**
   * Update race progress, checkpoints and laps
   */
  updateRaceProgress(track) {
    const checkpoint = track.checkCheckpoint(this.position.x, this.position.y, this.width / 2);
    
    // Check if we've hit a checkpoint
    if (checkpoint.hit) {
      // Check if this is the next checkpoint in sequence
      if (checkpoint.index === (this.checkpoint + 1) % track.checkpoints.length) {
        this.checkpoint = checkpoint.index;
        this.lastCheckpointTime = Date.now();
        
        // Check if we've completed a lap
        if (checkpoint.index === 0 && this.lap > 0) {
          this.completeLap();
        } else if (checkpoint.index === 0) {
          // Just starting the first lap
          this.lap = 1;
          this.lapStartTime = Date.now();
        }
      }
    }
  }
  
  /**
   * Handle lap completion
   */
  completeLap() {
    // Calculate lap time
    const lapTime = Date.now() - this.lapStartTime;
    
    // Check if this is a new best lap
    if (lapTime < this.bestLapTime) {
      this.bestLapTime = lapTime;
    }
    
    // Reset lap timer
    this.lapStartTime = Date.now();
    
    // Increment lap counter
    this.lap++;
    
    // Award health bonus for completing a lap
    this.health = Math.min(this.health + CONFIG.BALANCE.LAP_HEALTH_BONUS, 100);
    
    // Check if race is complete
    if (this.lap > CONFIG.MODES.GRAND_PRIX.laps) {
      this.finished = true;
    }
  }
  
  /**
   * Update power-up states
   */
  updatePowerups(deltaTime) {
    // Update active powerups and remove expired ones
    this.activePowerups = this.activePowerups.filter(powerup => {
      powerup.timeRemaining -= deltaTime * 1000;
      return powerup.timeRemaining > 0;
    });
    
    // Update shield status
    this.isShielded = this.activePowerups.some(powerup => 
      powerup.type === CONFIG.POWERUPS.SHIELD.id
    );
    
    // Update size for size reduction power-up
    const hasSizeReduction = this.activePowerups.some(powerup => 
      powerup.type === CONFIG.POWERUPS.SIZE_REDUCTION.id
    );
    
    if (hasSizeReduction) {
      this.width = 30;
      this.height = 22.5;
      this.collider.radius = 15;
    } else {
      this.width = 40;
      this.height = 30;
      this.collider.radius = 20;
    }
  }
  
  /**
   * Apply damage to the potato
   */
  applyDamage(amount) {
    if (!this.isShielded) {
      this.health -= amount;
      this.health = Helpers.clamp(this.health, 0, 100);
    }
  }
  
  /**
   * Regenerate health slowly over time
   */
  regenerateHealth(deltaTime) {
    if (this.health < 100) {
      this.health += CONFIG.BALANCE.HEALTH_REGEN * deltaTime;
      this.health = Math.min(this.health, 100);
    }
  }
  
  /**
   * Add a power-up to the potato
   */
  addPowerup(type) {
    // Check if we already have this power-up and refresh it if so
    const existingPowerupIndex = this.activePowerups.findIndex(p => p.type === type);
    
    if (existingPowerupIndex !== -1) {
      // Refresh the existing power-up
      this.activePowerups[existingPowerupIndex].timeRemaining = this.getPowerupDuration(type);
    } else {
      // Add new power-up
      this.activePowerups.push({
        type: type,
        timeRemaining: this.getPowerupDuration(type)
      });
    }
    
    // Special handling for oil slick - this creates an oil slick behind the potato
    if (type === CONFIG.POWERUPS.OIL_SLICK.id) {
      // Calculate position behind the potato
      const direction = this.getDirection();
      const oilSlickX = this.position.x - direction.x * this.width;
      const oilSlickY = this.position.y - direction.y * this.width;
      
      // Create the oil slick (handled by game class)
      return {
        type: CONFIG.POWERUPS.OIL_SLICK.id,
        position: { x: oilSlickX, y: oilSlickY },
        radius: 40,
        duration: CONFIG.POWERUPS.OIL_SLICK.duration
      };
    }
    
    return null;
  }
  
  /**
   * Use the active power-up (triggered by action button)
   */
  useActivePowerup() {
    // Check if we have any offensive power-ups (like oil slick)
    const oilSlickPowerup = this.activePowerups.find(p => p.type === CONFIG.POWERUPS.OIL_SLICK.id);
    
    if (oilSlickPowerup) {
      // Use the oil slick and remove it from inventory
      const result = this.addPowerup(CONFIG.POWERUPS.OIL_SLICK.id);
      
      // Remove from active powerups
      this.activePowerups = this.activePowerups.filter(p => p !== oilSlickPowerup);
      
      return result;
    }
    
    return null;
  }
  
  /**
   * Get the duration for a specific power-up type
   */
  getPowerupDuration(type) {
    for (const key in CONFIG.POWERUPS) {
      if (CONFIG.POWERUPS[key].id === type) {
        return CONFIG.POWERUPS[key].duration;
      }
    }
    return 3000; // Default duration
  }
  
  /**
   * Update animation properties
   */
  updateAnimationEffects(deltaTime) {
    // Calculate eye rotation to face the direction of movement
    const targetEyeRotation = Math.atan2(this.velocity.y, this.velocity.x) - this.rotation;
    this.eyeRotation = Helpers.lerp(this.eyeRotation, targetEyeRotation, 0.1);
    
    // Update hat position based on physics
    const speed = Physics.getSpeed(this);
    this.hatRotation = Helpers.lerp(this.hatRotation, this.velocity.x * 0.01, 0.1);
    this.hatPosition.y = Helpers.lerp(this.hatPosition.y, -15 - speed * 0.2, 0.1);
  }
  
  /**
   * Draw the potato
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera for transform
   * @param {boolean} isMainPlayer - Whether this is the main player (for UI)
   */
  draw(ctx, camera, isMainPlayer = false) {
    try {
      if (!this.visible) return;
      
      // Save context state
      ctx.save();
      
      // Apply camera transform
      if (camera && typeof camera.worldToScreen === 'function' && this.position && this.position.x !== undefined && this.position.y !== undefined) {
        // If camera has worldToScreen method, use it
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
        console.warn('Potato has no position to draw');
        ctx.restore();
        return;
      }
      
      // Apply rotation
      if (this.rotation !== undefined) {
        ctx.rotate(this.rotation);
      }
      
      // Draw ghost effect if has ghost power-up
      if (this.activePowerups && this.activePowerups.some(
        powerup => powerup && powerup.type === 'ghost'
      )) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 1.2 / 2, this.height * 1.2 / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 5, (this.width + 5) / 2, this.height * 0.5 / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw wheels
      const wheelColor = this.customization && this.customization.wheelColor ? 
        this.customization.wheelColor : '#333333';
      ctx.fillStyle = wheelColor;
      
      this.drawRoundedRect(ctx, -this.width * 0.3, -this.height * 0.6, this.width * 0.2, this.height * 0.2, 3);
      this.drawRoundedRect(ctx, this.width * 0.1, -this.height * 0.6, this.width * 0.2, this.height * 0.2, 3);
      this.drawRoundedRect(ctx, -this.width * 0.3, this.height * 0.4, this.width * 0.2, this.height * 0.2, 3);
      this.drawRoundedRect(ctx, this.width * 0.1, this.height * 0.4, this.width * 0.2, this.height * 0.2, 3);
      
      // Draw potato body
      ctx.fillStyle = this.color || '#A0522D';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw eyes
      this.drawEyes(ctx);
      
      // Draw hat
      this.drawHat(ctx);
      
      // Draw shield if active
      if (this.isShielded) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 1.4 / 2, this.height * 1.4 / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Draw player number
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.playerNumber.toString(), 0, 0);
      ctx.strokeText(this.playerNumber.toString(), 0, 0);
      
      // Draw health bar (only for main player or if damaged)
      if (isMainPlayer || this.health < 100) {
        this.drawHealthBar(ctx);
      }
      
      // Restore context
      ctx.restore();
    } catch (e) {
      console.error("Error drawing potato:", e);
      // Restore context in case of error
      ctx.restore();
      
      // Draw fallback potato (simple circle)
      try {
        ctx.save();
        
        // Simple position handling for fallback
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
        
        ctx.fillStyle = this.color || '#A0522D';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } catch (fallbackError) {
        console.error("Error drawing fallback potato:", fallbackError);
        ctx.restore();
      }
    }
  }
  
  /**
   * Draw a rounded rectangle
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Corner radius
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    radius = Math.min(radius, Math.min(width / 2, height / 2));
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Draw the eyes of the potato
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawEyes(ctx) {
    // Draw eyes based on eye type
    const eyeOffsetX = this.width * 0.15;
    const eyeOffsetY = -this.height * 0.1;
    const eyeSize = this.width * 0.2;
    
    // Draw eye whites
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(-eyeOffsetX, eyeOffsetY, eyeSize / 2, eyeSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeSize / 2, eyeSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils
    const eyeRotation = this.eyeRotation || 0;
    const pupilSize = eyeSize * 0.5;
    const pupilOffsetX = Math.cos(eyeRotation) * (eyeSize * 0.2);
    const pupilOffsetY = Math.sin(eyeRotation) * (eyeSize * 0.2);
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(-eyeOffsetX + pupilOffsetX, eyeOffsetY + pupilOffsetY, pupilSize / 2, pupilSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX + pupilOffsetX, eyeOffsetY + pupilOffsetY, pupilSize / 2, pupilSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyebrows based on health
    if (this.health < 50) {
      const browOffsetY = -eyeSize * 0.8;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      
      // Angry eyebrows when health is low
      ctx.beginPath();
      ctx.moveTo(-eyeOffsetX - eyeSize/2, eyeOffsetY + browOffsetY);
      ctx.lineTo(-eyeOffsetX + eyeSize/2, eyeOffsetY + browOffsetY - eyeSize * 0.3);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(eyeOffsetX - eyeSize/2, eyeOffsetY + browOffsetY - eyeSize * 0.3);
      ctx.lineTo(eyeOffsetX + eyeSize/2, eyeOffsetY + browOffsetY);
      ctx.stroke();
    }
  }
  
  /**
   * Draw hat based on hat type
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawHat(ctx) {
    const hatX = 0;
    const hatY = this.hatPosition ? this.hatPosition.y : -15;
    const hatRotation = this.hatRotation || 0;
    const hatType = this.customization && this.customization.hatType !== undefined ? 
      this.customization.hatType : 0;
    
    // Save context for hat rotation
    ctx.save();
    ctx.translate(hatX, hatY);
    ctx.rotate(hatRotation);
    
    switch(hatType) {
      case 0: // Chef hat
        ctx.fillStyle = '#FFF';
        this.drawRoundedRect(ctx, -this.width * 0.25, -this.height * 0.2, this.width * 0.5, this.height * 0.1, 2);
        ctx.beginPath();
        ctx.ellipse(0, -this.height * 0.3, this.width * 0.4 / 2, this.height * 0.3 / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 1: // Cowboy hat
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 0.7 / 2, this.height * 0.2 / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Hat top
        ctx.beginPath();
        ctx.ellipse(0, -this.height * 0.1, this.width * 0.4 / 2, this.height * 0.3 / 2, 0, Math.PI, 0, true);
        ctx.fill();
        break;
        
      case 2: // Top hat
        ctx.fillStyle = '#000';
        this.drawRoundedRect(ctx, -this.width * 0.2, -this.height * 0.2, this.width * 0.4, this.height * 0.1, 2);
        this.drawRoundedRect(ctx, -this.width * 0.15, -this.height * 0.4, this.width * 0.3, this.height * 0.2, 2);
        break;
        
      case 3: // Crown
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.moveTo(-this.width * 0.2, 0);
        ctx.lineTo(-this.width * 0.2, -this.height * 0.2);
        ctx.lineTo(-this.width * 0.1, -this.height * 0.1);
        ctx.lineTo(0, -this.height * 0.3);
        ctx.lineTo(this.width * 0.1, -this.height * 0.1);
        ctx.lineTo(this.width * 0.2, -this.height * 0.2);
        ctx.lineTo(this.width * 0.2, 0);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    // Restore context
    ctx.restore();
  }
  
  /**
   * Draw the health bar above the potato
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawHealthBar(ctx) {
    const barWidth = this.width * 1.2;
    const barHeight = 5;
    const barX = -barWidth / 2;
    const barY = -this.height * 0.7;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 2);
    
    // Draw health amount
    const healthWidth = (this.health / 100) * barWidth;
    const healthColor = this.health > 70 ? '#00FF00' : this.health > 30 ? '#FFFF00' : '#FF0000';
    
    ctx.fillStyle = healthColor;
    this.drawRoundedRect(ctx, barX, barY, healthWidth, barHeight, 2);
  }
  
  /**
   * Get the current race progress as a percentage
   * @param {number} totalCheckpoints - Total checkpoints in the track
   * @param {number} totalLaps - Total laps in the race
   * @returns {number} Progress as a value between 0 and 1
   */
  getRaceProgress(totalCheckpoints, totalLaps) {
    const checkpointProgress = this.checkpoint / totalCheckpoints;
    const lapProgress = (this.lap - 1) / totalLaps;
    
    return Helpers.clamp(lapProgress + checkpointProgress / totalLaps, 0, 1);
  }
} 