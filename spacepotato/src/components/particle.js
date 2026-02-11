/**
 * particle.js
 * Particle system for visual effects
 */

class Particle {
  /**
   * Create a new particle
   * @param {Object} options - Particle options
   */
  constructor(options = {}) {
    this.position = {
      x: options.x || 0,
      y: options.y || 0
    };
    
    this.velocity = {
      x: options.velocityX || 0,
      y: options.velocityY || 0
    };
    
    this.acceleration = {
      x: options.accelerationX || 0,
      y: options.accelerationY || 0
    };
    
    this.size = options.size || 5;
    this.color = options.color || [255, 255, 255];
    this.alpha = options.alpha || 1;
    this.fadeRate = options.fadeRate || 0.05;
    this.shrinkRate = options.shrinkRate || 0;
    this.lifetime = options.lifetime || 1; // seconds
    this.age = 0;
    this.isDead = false;
    this.gravity = options.gravity || 0;
    this.rotation = options.rotation || 0;
    this.rotationSpeed = options.rotationSpeed || 0;
    this.blendMode = options.blendMode || null;
    this.drag = options.drag || 0;
    this.shape = options.shape || 'circle'; // circle, square, triangle, image
    this.image = options.image || null;
  }
  
  /**
   * Update the particle
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Update age and check if particle should die
    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.isDead = true;
      return;
    }
    
    // Apply acceleration
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;
    
    // Apply drag
    if (this.drag > 0) {
      this.velocity.x *= (1 - this.drag * deltaTime);
      this.velocity.y *= (1 - this.drag * deltaTime);
    }
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;
    
    // Update alpha
    this.alpha -= this.fadeRate * deltaTime;
    if (this.alpha < 0) this.alpha = 0;
    
    // Update size
    if (this.shrinkRate > 0) {
      this.size -= this.shrinkRate * deltaTime;
      if (this.size < 0) {
        this.size = 0;
        this.isDead = true;
      }
    }
  }
  
  /**
   * Draw the particle
   * @param {Object} p - p5.js instance
   */
  draw(p) {
    p.push();
    
    // Set blend mode if specified
    if (this.blendMode) {
      p.blendMode(this.blendMode);
    }
    
    // Set color and alpha
    if (Array.isArray(this.color)) {
      p.fill(this.color[0], this.color[1], this.color[2], this.alpha * 255);
    } else {
      p.fill(this.color);
    }
    
    // No stroke
    p.noStroke();
    
    // Draw at position with rotation
    p.translate(this.position.x, this.position.y);
    p.rotate(this.rotation);
    
    // Draw shape
    switch (this.shape) {
      case 'square':
        p.rectMode(p.CENTER);
        p.rect(0, 0, this.size, this.size);
        break;
        
      case 'triangle':
        const halfSize = this.size / 2;
        p.triangle(0, -halfSize, -halfSize, halfSize, halfSize, halfSize);
        break;
        
      case 'image':
        if (this.image) {
          p.imageMode(p.CENTER);
          p.image(this.image, 0, 0, this.size, this.size);
        } else {
          p.ellipse(0, 0, this.size);
        }
        break;
        
      case 'circle':
      default:
        p.ellipse(0, 0, this.size);
    }
    
    p.pop();
  }
}

// Particle system for managing particles
class ParticleSystem {
  static particles = [];
  static emitters = [];
  static maxParticles = 500;
  static images = {};
  
  /**
   * Initialize the particle system
   * @param {Object} config - Configuration options
   */
  static init(config = {}) {
    this.maxParticles = config.maxParticles || 500;
    this.particles = [];
    this.emitters = [];
  }
  
  /**
   * Load particle images
   * @param {Object} p - p5.js instance
   * @param {Object} images - Image paths indexed by name
   */
  static loadImages(p, images) {
    Object.keys(images).forEach(key => {
      this.images[key] = p.loadImage(images[key]);
    });
  }
  
  /**
   * Create a new particle
   * @param {Object} options - Particle options
   */
  static createParticle(options) {
    // Check if at max particles
    if (this.particles.length >= this.maxParticles) {
      // Remove oldest particle
      this.particles.shift();
    }
    
    // Convert string image name to actual image
    if (options.imageName && this.images[options.imageName]) {
      options.image = this.images[options.imageName];
    }
    
    // Create and add particle
    const particle = new Particle(options);
    this.particles.push(particle);
    return particle;
  }
  
  /**
   * Create a burst of particles
   * @param {Object} options - Burst options
   */
  static createBurst(options) {
    const count = options.count || 10;
    const baseOptions = { ...options };
    
    // Remove burst-specific properties
    delete baseOptions.count;
    delete baseOptions.angleRange;
    delete baseOptions.speed;
    delete baseOptions.size;
    delete baseOptions.lifetime;
    
    for (let i = 0; i < count; i++) {
      // Calculate random angle if range is specified
      let angle, speed, size, lifetime;
      
      if (options.angleRange) {
        const minAngle = options.angleRange.min || 0;
        const maxAngle = options.angleRange.max || Math.PI * 2;
        angle = Helpers.random(minAngle, maxAngle);
      } else {
        angle = Helpers.random(0, Math.PI * 2);
      }
      
      // Calculate random speed if range is specified
      if (options.speed) {
        const minSpeed = options.speed.min || 50;
        const maxSpeed = options.speed.max || 100;
        speed = Helpers.random(minSpeed, maxSpeed);
      } else {
        speed = 50;
      }
      
      // Calculate random size if range is specified
      if (options.size) {
        const minSize = options.size.min || 5;
        const maxSize = options.size.max || 10;
        size = Helpers.random(minSize, maxSize);
      } else {
        size = 5;
      }
      
      // Calculate random lifetime if range is specified
      if (options.lifetime) {
        const minLifetime = options.lifetime.min || 0.5;
        const maxLifetime = options.lifetime.max || 1;
        lifetime = Helpers.random(minLifetime, maxLifetime);
      } else {
        lifetime = 1;
      }
      
      // Calculate velocity from angle and speed
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      // Create particle with calculated values
      this.createParticle({
        ...baseOptions,
        velocityX,
        velocityY,
        size,
        lifetime
      });
    }
  }
  
  /**
   * Create a trail of particles behind an object
   * @param {Object} options - Trail options
   */
  static createTrail(options) {
    const spawnChance = options.spawnChance || 1;
    
    // Only spawn particle based on chance
    if (Math.random() > spawnChance) return;
    
    // Calculate random offset if specified
    let offsetX = 0;
    let offsetY = 0;
    
    if (options.offset) {
      offsetX = Helpers.random(-options.offset, options.offset);
      offsetY = Helpers.random(-options.offset, options.offset);
    }
    
    // Create particle with velocity opposite to object's direction
    const velocityX = options.velocityX || (options.reverseVelocity ? -options.objectVelocityX * 0.3 : 0);
    const velocityY = options.velocityY || (options.reverseVelocity ? -options.objectVelocityY * 0.3 : 0);
    
    this.createParticle({
      x: options.x + offsetX,
      y: options.y + offsetY,
      velocityX,
      velocityY,
      size: options.size || 5,
      color: options.color || [255, 255, 255],
      alpha: options.alpha || 0.7,
      fadeRate: options.fadeRate || 0.1,
      lifetime: options.lifetime || 0.5,
      shape: options.shape || 'circle'
    });
  }
  
  /**
   * Update all particles
   * @param {number} deltaTime - Time since last frame in seconds
   */
  static update(deltaTime) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.update(deltaTime);
      
      // Remove dead particles
      if (particle.isDead) {
        this.particles.splice(i, 1);
      }
    }
    
    // Update emitters
    for (const emitter of this.emitters) {
      emitter.update(deltaTime, this);
    }
  }
  
  /**
   * Draw all particles
   * @param {Object} p - p5.js instance
   */
  static draw(p) {
    for (const particle of this.particles) {
      particle.draw(p);
    }
  }
}

// Export the ParticleSystem for global use
window.ParticleSystem = ParticleSystem; 