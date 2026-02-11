/**
 * camera.js
 * Camera system for the racing game
 */

class Camera {
  /**
   * Create a new camera
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  constructor(width, height) {
    // Camera position (world space)
    this.position = { x: 0, y: 0 };
    
    // Screen dimensions
    this.width = width;
    this.height = height;
    
    // Target to follow
    this.target = null;
    
    // Camera properties
    this.zoom = 1.0;
    this.maxZoom = 2.0;
    this.minZoom = 0.5;
    this.rotateWithTarget = false;
    this.rotation = 0;
    
    // Camera boundaries
    this.hasBounds = false;
    this.bounds = {
      left: -Infinity,
      right: Infinity,
      top: -Infinity,
      bottom: Infinity
    };
    
    // Camera follow settings
    this.followStrength = 0.1; // 1 = immediate, 0 = no movement
    this.followAhead = true; // Look ahead in the direction of movement
    this.lookAheadDistance = 100; // How far to look ahead
    this.lookAheadStrength = 0.5; // How strongly to look ahead (0-1)
  }
  
  /**
   * Set the target for the camera to follow
   * @param {Object} target - Target object with position and optionally velocity and rotation
   */
  setTarget(target) {
    this.target = target;
  }
  
  /**
   * Set camera boundaries
   * @param {number} left - Left boundary
   * @param {number} right - Right boundary
   * @param {number} top - Top boundary
   * @param {number} bottom - Bottom boundary
   */
  setBounds(left, right, top, bottom) {
    this.hasBounds = true;
    this.bounds.left = left;
    this.bounds.right = right;
    this.bounds.top = top;
    this.bounds.bottom = bottom;
  }
  
  /**
   * Clear camera boundaries
   */
  clearBounds() {
    this.hasBounds = false;
    this.bounds = {
      left: -Infinity,
      right: Infinity,
      top: -Infinity,
      bottom: Infinity
    };
  }
  
  /**
   * Set camera zoom
   * @param {number} zoom - Zoom level
   */
  setZoom(zoom) {
    this.zoom = Helpers.clamp(zoom, this.minZoom, this.maxZoom);
  }
  
  /**
   * Update camera position to follow target
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.target) return;
    
    // Calculate target position with look-ahead
    let targetX = this.target.position.x;
    let targetY = this.target.position.y;
    
    // Apply look-ahead based on velocity if available
    if (this.followAhead && this.target.velocity) {
      const speed = Math.sqrt(
        this.target.velocity.x * this.target.velocity.x + 
        this.target.velocity.y * this.target.velocity.y
      );
      
      if (speed > 0.1) {
        const lookAheadFactor = Math.min(speed / 5, 1) * this.lookAheadStrength;
        
        targetX += this.target.velocity.x / speed * this.lookAheadDistance * lookAheadFactor;
        targetY += this.target.velocity.y / speed * this.lookAheadDistance * lookAheadFactor;
      }
    }
    
    // Apply rotation if enabled
    if (this.rotateWithTarget && typeof this.target.rotation === 'number') {
      const targetRotation = this.target.rotation;
      
      // Smoothly interpolate to target rotation
      const rotDiff = targetRotation - this.rotation;
      
      // Ensure we rotate the shortest way
      let rotChange = rotDiff;
      while (rotChange > Math.PI) rotChange -= Math.PI * 2;
      while (rotChange < -Math.PI) rotChange += Math.PI * 2;
      
      this.rotation += rotChange * this.followStrength * 60 * deltaTime;
    }
    
    // Convert target position to screen center
    targetX = -(targetX * this.zoom - this.width / 2);
    targetY = -(targetY * this.zoom - this.height / 2);
    
    // Smoothly interpolate to target position
    this.position.x += (targetX - this.position.x) * this.followStrength * 60 * deltaTime;
    this.position.y += (targetY - this.position.y) * this.followStrength * 60 * deltaTime;
    
    // Apply camera boundaries if enabled
    if (this.hasBounds) {
      // Calculate visible area in world space
      const visibleLeft = -this.position.x / this.zoom;
      const visibleTop = -this.position.y / this.zoom;
      const visibleRight = visibleLeft + this.width / this.zoom;
      const visibleBottom = visibleTop + this.height / this.zoom;
      
      // Adjust position to stay within bounds
      if (visibleLeft < this.bounds.left) {
        this.position.x = -(this.bounds.left * this.zoom);
      }
      
      if (visibleRight > this.bounds.right) {
        this.position.x = -(this.bounds.right * this.zoom - this.width);
      }
      
      if (visibleTop < this.bounds.top) {
        this.position.y = -(this.bounds.top * this.zoom);
      }
      
      if (visibleBottom > this.bounds.bottom) {
        this.position.y = -(this.bounds.bottom * this.zoom - this.height);
      }
    }
  }
  
  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - World X coordinate
   * @param {number} worldY - World Y coordinate
   * @returns {Object} Screen coordinates
   */
  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.zoom + this.position.x,
      y: worldY * this.zoom + this.position.y
    };
  }
  
  /**
   * Convert screen coordinates to world coordinates
   * @param {number} screenX - Screen X coordinate
   * @param {number} screenY - Screen Y coordinate
   * @returns {Object} World coordinates
   */
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.position.x) / this.zoom,
      y: (screenY - this.position.y) / this.zoom
    };
  }
  
  /**
   * Apply camera transform to p5 context
   * @param {Object} p - p5.js instance
   */
  apply(p) {
    p.translate(this.position.x, this.position.y);
    
    if (this.rotateWithTarget) {
      p.translate(this.width / 2, this.height / 2);
      p.rotate(-this.rotation);
      p.translate(-this.width / 2, -this.height / 2);
    }
    
    p.scale(this.zoom);
  }
  
  /**
   * Begin camera transformation on canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  begin(ctx) {
    // Save the context state before applying camera transforms
    ctx.save();
    
    // Apply camera transformations
    ctx.translate(this.position.x, this.position.y);
    
    if (this.rotateWithTarget) {
      ctx.translate(this.width / 2, this.height / 2);
      ctx.rotate(-this.rotation);
      ctx.translate(-this.width / 2, -this.height / 2);
    }
    
    ctx.scale(this.zoom, this.zoom);
  }
  
  /**
   * End camera transformation on canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  end(ctx) {
    // Restore the context to its state before camera transforms
    ctx.restore();
  }
  
  /**
   * Shake the camera
   * @param {number} intensity - Shake intensity
   * @param {number} duration - Shake duration in milliseconds
   */
  shake(intensity, duration) {
    // Store original position
    const originalX = this.position.x;
    const originalY = this.position.y;
    
    // Setup shake parameters
    let shakeTime = 0;
    const shakeFPS = 60;
    const shakeInterval = 1000 / shakeFPS;
    
    // Create shake animation
    const shakeIntervalId = setInterval(() => {
      // Update shake time
      shakeTime += shakeInterval;
      
      // Calculate shake offset
      const shakeOffsetX = (Math.random() * 2 - 1) * intensity;
      const shakeOffsetY = (Math.random() * 2 - 1) * intensity;
      
      // Apply shake offset
      this.position.x = originalX + shakeOffsetX;
      this.position.y = originalY + shakeOffsetY;
      
      // Check if shake is complete
      if (shakeTime >= duration) {
        // Restore original position
        this.position.x = originalX;
        this.position.y = originalY;
        
        // Stop shake animation
        clearInterval(shakeIntervalId);
      }
    }, shakeInterval);
  }
  
  /**
   * Smoothly zoom to a new level
   * @param {number} targetZoom - Target zoom level
   * @param {number} duration - Zoom duration in milliseconds
   */
  zoomTo(targetZoom, duration = 500) {
    // Clamp target zoom
    targetZoom = Helpers.clamp(targetZoom, this.minZoom, this.maxZoom);
    
    // Store original zoom
    const originalZoom = this.zoom;
    
    // Store time values
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    // Calculate zoom change
    const zoomChange = targetZoom - originalZoom;
    
    // Create zoom animation
    const zoomInterval = setInterval(() => {
      const now = Date.now();
      
      // Calculate progress (0 to 1)
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Apply easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Update zoom
      this.zoom = originalZoom + zoomChange * easedProgress;
      
      // Check if zoom is complete
      if (now >= endTime) {
        this.zoom = targetZoom;
        clearInterval(zoomInterval);
      }
    }, 16);
  }
  
  /**
   * Draw debug information
   * @param {Object} p - p5.js instance
   */
  drawDebug(p) {
    p.push();
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(10);
    
    const info = [
      `Camera Position: (${Math.floor(this.position.x)}, ${Math.floor(this.position.y)})`,
      `Camera Zoom: ${this.zoom.toFixed(2)}`,
      `Camera Rotation: ${this.rotation.toFixed(2)}`,
      `Target: ${this.target ? 'Set' : 'None'}`
    ];
    
    for (let i = 0; i < info.length; i++) {
      p.text(info[i], 10, 10 + i * 15);
    }
    
    p.pop();
  }
} 