/**
 * sprite.js
 * Base sprite class for game objects
 */

class Sprite {
  /**
   * Create a new sprite
   * @param {number|Object} xOrOptions - X position or options object
   * @param {number} y - Y position (if first param is a number)
   */
  constructor(xOrOptions = 0, y = 0) {
    try {
      // Handle both positional parameters and options object
      let x = 0;
      let options = {};
      
      if (typeof xOrOptions === 'object' && xOrOptions !== null) {
        options = xOrOptions || {};
        
        // Safely extract position from options
        if (options.position && typeof options.position === 'object') {
          x = typeof options.position.x === 'number' ? options.position.x : 0;
          y = typeof options.position.y === 'number' ? options.position.y : 0;
        } else {
          x = typeof options.x === 'number' ? options.x : 0;
          y = typeof options.y === 'number' ? options.y : 0;
        }
      } else if (typeof xOrOptions === 'number') {
        x = xOrOptions;
        y = typeof y === 'number' ? y : 0;
      }
      
      // Position and movement
      this.position = { x, y };
      
      // Ensure velocity is an object
      this.velocity = (options.velocity && typeof options.velocity === 'object') ? 
        { x: typeof options.velocity.x === 'number' ? options.velocity.x : 0, 
          y: typeof options.velocity.y === 'number' ? options.velocity.y : 0 } : 
        { x: 0, y: 0 };
      
      // Ensure acceleration is an object
      this.acceleration = (options.acceleration && typeof options.acceleration === 'object') ? 
        { x: typeof options.acceleration.x === 'number' ? options.acceleration.x : 0, 
          y: typeof options.acceleration.y === 'number' ? options.acceleration.y : 0 } : 
        { x: 0, y: 0 };
      
      // Set rotation and angular velocity
      this.rotation = typeof options.rotation === 'number' ? options.rotation : 0;
      this.angularVelocity = typeof options.angularVelocity === 'number' ? options.angularVelocity : 0;
      
      // For backward compatibility
      this.x = x;
      this.y = y;
      
      // Collision
      if (options.collider && typeof options.collider === 'object') {
        this.collider = options.collider;
      } else {
        const radius = typeof options.radius === 'number' ? options.radius : 20;
        this.collider = { radius };
      }
      
      // Rendering
      this.width = typeof options.width === 'number' ? options.width : 40;
      this.height = typeof options.height === 'number' ? options.height : 40;
      this.visible = options.visible !== undefined ? !!options.visible : true;
      this.alpha = typeof options.alpha === 'number' ? options.alpha : 1;
      
      // Other properties
      this.color = options.color || [255, 255, 255];
      this.layer = typeof options.layer === 'number' ? options.layer : 0;
      this.id = options.id || Math.random().toString(36).substr(2, 9);
      
      // Physics properties
      this.friction = typeof options.friction === 'number' ? options.friction : 0.98;
      this.mass = typeof options.mass === 'number' ? options.mass : 1;
      this.restitution = typeof options.restitution === 'number' ? options.restitution : 0.5;
      
      // Game object properties
      this.active = options.active !== undefined ? !!options.active : true;
      this.tags = Array.isArray(options.tags) ? [...options.tags] : [];
      
      // Initialize with tags if provided
      if (options.tag) this.addTag(options.tag);
    } catch (err) {
      console.error('Error in Sprite constructor:', err);
      
      // Ensure minimum required properties exist even in case of error
      this.position = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      this.acceleration = { x: 0, y: 0 };
      this.rotation = 0;
      this.collider = { radius: 20 };
      this.active = true;
      this.tags = [];
    }
  }
  
  /**
   * Update the sprite's position and physics
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    try {
      if (!this.active) return;
      
      // Ensure deltaTime is valid
      const dt = typeof deltaTime === 'number' ? deltaTime : 1/60;
      
      // Ensure velocity, position, and acceleration exist
      if (!this.velocity || typeof this.velocity !== 'object') {
        this.velocity = { x: 0, y: 0 };
      }
      
      if (!this.position || typeof this.position !== 'object') {
        this.position = { x: 0, y: 0 };
      }
      
      if (!this.acceleration || typeof this.acceleration !== 'object') {
        this.acceleration = { x: 0, y: 0 };
      }
      
      // Update velocity with acceleration
      this.velocity.x += this.acceleration.x * dt;
      this.velocity.y += this.acceleration.y * dt;
      
      // Update position with velocity
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      
      // Update rotation with angular velocity (if defined)
      if (this.rotation !== undefined && this.angularVelocity !== undefined) {
        this.rotation += this.angularVelocity * dt;
      } else if (this.angularVelocity !== undefined) {
        this.rotation = (this.rotation || 0) + this.angularVelocity * dt;
      }
      
      // Update x and y for backward compatibility
      this.x = this.position.x;
      this.y = this.position.y;
      
      // Apply friction (with safety check)
      const friction = typeof this.friction === 'number' ? this.friction : 0.98;
      this.velocity.x *= friction;
      this.velocity.y *= friction;
      
      // Reset acceleration
      this.acceleration.x = 0;
      this.acceleration.y = 0;
    } catch (err) {
      console.error('Error in sprite update:', err);
    }
  }
  
  /**
   * Apply a force to the sprite
   * @param {number} x - X component of force
   * @param {number} y - Y component of force
   */
  applyForce(x, y) {
    try {
      // Ensure acceleration is an object
      if (!this.acceleration || typeof this.acceleration !== 'object') {
        this.acceleration = { x: 0, y: 0 };
      }
      
      // Ensure mass has a valid value
      const mass = this.mass || 1;
      
      // Ensure x and y are numbers
      const forceX = typeof x === 'number' ? x : 0;
      const forceY = typeof y === 'number' ? y : 0;
      
      // Apply force
      this.acceleration.x += forceX / mass;
      this.acceleration.y += forceY / mass;
    } catch (err) {
      console.error('Error in applyForce:', err);
    }
  }
  
  /**
   * Get the direction vector based on current rotation
   * @returns {Object} Direction vector {x, y}
   */
  getDirection() {
    try {
      // Ensure rotation is defined
      if (this.rotation === undefined || this.rotation === null) {
        console.warn('getDirection called with undefined rotation, using default 0');
        return { x: 1, y: 0 };
      }
      
      // Calculate direction vector
      return {
        x: Math.cos(this.rotation),
        y: Math.sin(this.rotation)
      };
    } catch (err) {
      console.error('Error in getDirection:', err);
      return { x: 1, y: 0 }; // Default direction (right)
    }
  }
  
  /**
   * Check collision with another sprite or object
   * @param {Sprite|Object} other - Other sprite or object to check collision with
   * @returns {Object|boolean} Collision data or boolean for simple collision check
   */
  checkCollision(other) {
    // Handle potential null/undefined values
    if (!other) return false;
    
    try {
      // Get positions safely
      const thisPos = this.position || { x: this.x || 0, y: this.y || 0 };
      
      // Handle both sprite objects and plain objects with position
      const otherPos = other.position || { x: other.x || 0, y: other.y || 0 };
      
      // Get collision radius (with fallbacks)
      const thisRadius = (this.collider && this.collider.radius) || this.radius || 20;
      const otherRadius = (other.collider && other.collider.radius) || other.radius || 20;
      
      // Calculate distance between centers
      const dx = thisPos.x - otherPos.x;
      const dy = thisPos.y - otherPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = thisRadius + otherRadius;
      
      if (distance < minDistance) {
        // For advanced collision handling, return more data
        if (this.advancedCollision) {
          // Calculate normal
          const nx = dx / distance || 0; // Avoid division by zero
          const ny = dy / distance || 0; // Avoid division by zero
          
          return {
            colliding: true,
            normal: { x: nx, y: ny },
            overlap: minDistance - distance,
            point: {
              x: thisPos.x + nx * thisRadius,
              y: thisPos.y + ny * thisRadius
            }
          };
        }
        
        // Simple collision detected
        return true;
      }
      
      // No collision
      return false;
    } catch (err) {
      console.error("Error in collision detection:", err);
      return false;
    }
  }
  
  /**
   * Draw the sprite
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera for transform
   */
  draw(ctx, camera) {
    if (!this.visible) return;
    
    // Save context state
    ctx.save();
    
    // Apply camera transform if available
    if (camera && typeof camera.worldToScreen === 'function') {
      // If camera has worldToScreen method, use it
      const screenPos = camera.worldToScreen(this.position.x, this.position.y);
      ctx.translate(screenPos.x, screenPos.y);
    } else {
      // No camera, just use world coordinates
      ctx.translate(this.position.x, this.position.y);
    }
    
    // Apply rotation
    ctx.rotate(this.rotation);
    
    // Apply alpha
    ctx.globalAlpha = this.alpha;
    
    // Draw sprite (default is a colored rectangle)
    ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Restore context
    ctx.restore();
  }
  
  /**
   * Add a tag to the sprite
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }
  
  /**
   * Check if sprite has a tag
   * @param {string} tag - Tag to check
   * @returns {boolean} True if sprite has the tag
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }
}

// Export the sprite class globally
window.Sprite = Sprite; 