/**
 * physics.js
 * Physics engine for the Potato Racing game
 */

const Physics = {
  /**
   * Apply forces to a moving object
   * @param {Object} object - Object with position, velocity, acceleration properties
   * @param {number} dt - Delta time in seconds
   */
  updatePhysics(object, dt) {
    // Apply acceleration to velocity
    object.velocity.x += object.acceleration.x * dt;
    object.velocity.y += object.acceleration.y * dt;
    
    // Apply velocity to position
    object.position.x += object.velocity.x * dt;
    object.position.y += object.velocity.y * dt;
    
    // Apply angular forces if object has rotation
    if (object.angularVelocity !== undefined) {
      object.rotation += object.angularVelocity * dt;
    }
    
    // Apply drag/friction
    if (object.friction !== undefined) {
      const frictionFactor = Math.pow(1 - object.friction, dt);
      object.velocity.x *= frictionFactor;
      object.velocity.y *= frictionFactor;
      
      if (object.angularVelocity !== undefined) {
        object.angularVelocity *= frictionFactor;
      }
    }
  },
  
  /**
   * Apply a force to an object
   * @param {Object} object - Object with acceleration and mass properties
   * @param {Object} force - Force vector {x, y}
   */
  applyForce(object, force) {
    const mass = object.mass || 1;
    object.acceleration.x += force.x / mass;
    object.acceleration.y += force.y / mass;
  },
  
  /**
   * Reset acceleration after applying forces
   * @param {Object} object - Object with acceleration property
   */
  resetAcceleration(object) {
    object.acceleration.x = 0;
    object.acceleration.y = 0;
  },
  
  /**
   * Calculate if two circles are colliding
   * @param {Object} a - First circle {position: {x, y}, radius}
   * @param {Object} b - Second circle {position: {x, y}, radius}
   * @returns {Object} Collision data
   */
  checkCircleCollision(a, b) {
    try {
      if (!a || !b || !a.position || !b.position) return { colliding: false };
      
      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (a.radius || 0) + (b.radius || 0);
      
      if (distance < minDistance) {
        // Calculate normal
        const nx = dx / (distance || 1); // Avoid division by zero
        const ny = dy / (distance || 1);
        
        // Calculate overlap
        const overlap = minDistance - distance;
        
        return {
          colliding: true,
          normal: { x: nx, y: ny },
          overlap,
          point: {
            x: a.position.x + nx * (a.radius || 0),
            y: a.position.y + ny * (a.radius || 0)
          }
        };
      }
      
      return { colliding: false };
    } catch (err) {
      console.error("Error in Physics.checkCircleCollision:", err);
      return { colliding: false };
    }
  },
  
  /**
   * Resolve a collision between two physics objects
   * @param {Object} a - First object
   * @param {Object} b - Second object
   * @param {Object} collision - Collision data from checkCircleCollision
   */
  resolveCollision(a, b, collision) {
    try {
      // Make sure all objects and properties exist
      if (!a || !b || !collision) return;
      if (!a.position || !b.position) return;
      if (!a.velocity || !b.velocity) return;
      
      // Calculate relative velocity
      const relVelX = a.velocity.x - b.velocity.x;
      const relVelY = a.velocity.y - b.velocity.y;
      
      // Calculate relative velocity in terms of the normal direction
      const normal = collision.normal || { x: 0, y: 0 };
      const dotProduct = relVelX * normal.x + relVelY * normal.y;
      
      // Do not resolve if velocities are separating
      if (dotProduct > 0) return;
      
      // Calculate restitution (bounciness)
      const restitution = Math.min(
        (a.restitution !== undefined ? a.restitution : 0.5),
        (b.restitution !== undefined ? b.restitution : 0.5)
      );
      
      // Calculate impulse scalar
      const impulseMag = -(1 + restitution) * dotProduct / 
                        ((1 / (a.mass || 1)) + (1 / (b.mass || 1)));
      
      // Apply impulse
      const impulseX = impulseMag * normal.x;
      const impulseY = impulseMag * normal.y;
      
      a.velocity.x += impulseX / (a.mass || 1);
      a.velocity.y += impulseY / (a.mass || 1);
      b.velocity.x -= impulseX / (b.mass || 1);
      b.velocity.y -= impulseY / (b.mass || 1);
      
      // Move objects apart to prevent sticking
      if (collision.overlap) {
        const percent = 0.2; // penetration resolution percentage
        const correction = collision.overlap * percent;
        
        a.position.x += normal.x * correction * (b.mass || 1) / ((a.mass || 1) + (b.mass || 1));
        a.position.y += normal.y * correction * (b.mass || 1) / ((a.mass || 1) + (b.mass || 1));
        b.position.x -= normal.x * correction * (a.mass || 1) / ((a.mass || 1) + (b.mass || 1));
        b.position.y -= normal.y * correction * (a.mass || 1) / ((a.mass || 1) + (b.mass || 1));
      }
    } catch (err) {
      console.error("Error in Physics.resolveCollision:", err);
    }
  },
  
  /**
   * Check if an object is colliding with a line segment
   * @param {Object} object - Object with position and radius
   * @param {Object} line - Line segment {start: {x, y}, end: {x, y}}
   * @returns {Object} Collision data
   */
  checkLineCollision(object, line) {
    // Vector from line start to end
    const lineVecX = line.end.x - line.start.x;
    const lineVecY = line.end.y - line.start.y;
    
    // Vector from line start to object
    const objectVecX = object.position.x - line.start.x;
    const objectVecY = object.position.y - line.start.y;
    
    // Project objectVec onto lineVec
    const lineLength = Math.sqrt(lineVecX * lineVecX + lineVecY * lineVecY);
    const normLineVecX = lineVecX / lineLength;
    const normLineVecY = lineVecY / lineLength;
    
    // Dot product to find projected point
    const projection = objectVecX * normLineVecX + objectVecY * normLineVecY;
    
    // Clamp projection to line segment
    const clampedProjection = Math.max(0, Math.min(lineLength, projection));
    
    // Calculate closest point on line
    const closestX = line.start.x + normLineVecX * clampedProjection;
    const closestY = line.start.y + normLineVecY * clampedProjection;
    
    // Calculate distance from object to closest point
    const distanceX = object.position.x - closestX;
    const distanceY = object.position.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    // Check if colliding
    if (distance < object.radius) {
      // Calculate normal
      const normalX = distanceX / distance;
      const normalY = distanceY / distance;
      
      return {
        colliding: true,
        normal: { x: normalX, y: normalY },
        overlap: object.radius - distance,
        point: { x: closestX, y: closestY }
      };
    }
    
    return { colliding: false };
  },
  
  /**
   * Resolve a collision between an object and a line
   * @param {Object} object - Physics object
   * @param {Object} collision - Collision data
   */
  resolveLineCollision(object, collision) {
    // Move object outside of line
    object.position.x += collision.normal.x * collision.overlap;
    object.position.y += collision.normal.y * collision.overlap;
    
    // Calculate velocity dot normal
    const dotProduct = object.velocity.x * collision.normal.x + object.velocity.y * collision.normal.y;
    
    // Only reflect if moving toward the line
    if (dotProduct < 0) {
      // Calculate reflection
      const restitution = object.restitution || 0.5;
      
      // Apply reflection impulse
      object.velocity.x -= (1 + restitution) * dotProduct * collision.normal.x;
      object.velocity.y -= (1 + restitution) * dotProduct * collision.normal.y;
    }
  },
  
  /**
   * Calculate the current speed of an object
   * @param {Object} object - Object with velocity property
   * @returns {number} Speed
   */
  getSpeed(object) {
    try {
      if (!object || !object.velocity) return 0;
      
      const vx = object.velocity.x || 0;
      const vy = object.velocity.y || 0;
      return Math.sqrt(vx * vx + vy * vy);
    } catch (err) {
      console.error("Error in Physics.getSpeed:", err);
      return 0;
    }
  },
  
  /**
   * Limit the maximum speed of an object
   * @param {Object} object - Object with velocity property
   * @param {number} maxSpeed - Maximum speed
   */
  limitSpeed(object, maxSpeed) {
    const currentSpeed = this.getSpeed(object);
    
    if (currentSpeed > maxSpeed) {
      const ratio = maxSpeed / currentSpeed;
      object.velocity.x *= ratio;
      object.velocity.y *= ratio;
    }
  },
  
  /**
   * Apply a steering force to an object
   * @param {Object} object - Physics object
   * @param {Object} target - Target position {x, y}
   * @param {number} maxForce - Maximum steering force
   */
  seek(object, target, maxForce) {
    // Calculate desired velocity
    const desiredVelocityX = target.x - object.position.x;
    const desiredVelocityY = target.y - object.position.y;
    
    // Normalize and scale by max speed
    const distance = Math.sqrt(desiredVelocityX * desiredVelocityX + desiredVelocityY * desiredVelocityY);
    
    // If we're very close, return zero force
    if (distance < 0.01) return { x: 0, y: 0 };
    
    let desiredX = desiredVelocityX / distance * object.maxSpeed;
    let desiredY = desiredVelocityY / distance * object.maxSpeed;
    
    // Calculate steering force
    let steerX = desiredX - object.velocity.x;
    let steerY = desiredY - object.velocity.y;
    
    // Limit steering force
    const steerMagnitude = Math.sqrt(steerX * steerX + steerY * steerY);
    if (steerMagnitude > maxForce) {
      steerX = (steerX / steerMagnitude) * maxForce;
      steerY = (steerY / steerMagnitude) * maxForce;
    }
    
    return { x: steerX, y: steerY };
  }
}; 