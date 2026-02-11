/**
 * helpers.js
 * Utility functions for the potato racing game
 */

class Helpers {
  /**
   * Clamps a value between a minimum and maximum
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  /**
   * Linear interpolation between two values
   * @param {number} a - First value
   * @param {number} b - Second value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  /**
   * Map a value from one range to another
   * @param {number} value - Value to map
   * @param {number} inMin - Input minimum
   * @param {number} inMax - Input maximum
   * @param {number} outMin - Output minimum
   * @param {number} outMax - Output maximum
   * @returns {number} Mapped value
   */
  static map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
  
  /**
   * Calculates the distance between two points
   * @param {number} x1 - X coordinate of first point
   * @param {number} y1 - Y coordinate of first point
   * @param {number} x2 - X coordinate of second point
   * @param {number} y2 - Y coordinate of second point
   * @returns {number} Distance between points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Calculates the angle between two points in radians
   * @param {number} x1 - X coordinate of first point
   * @param {number} y1 - Y coordinate of first point
   * @param {number} x2 - X coordinate of second point
   * @param {number} y2 - Y coordinate of second point
   * @returns {number} Angle in radians
   */
  static angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
  
  /**
   * Converts degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  /**
   * Converts radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  static toDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  
  /**
   * Generates a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generates a random float between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random float
   */
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  /**
   * Checks if a point is inside a rectangle
   * @param {number} px - Point X coordinate
   * @param {number} py - Point Y coordinate
   * @param {number} rx - Rectangle center X coordinate
   * @param {number} ry - Rectangle center Y coordinate
   * @param {number} rw - Rectangle width
   * @param {number} rh - Rectangle height
   * @returns {boolean} True if the point is inside the rectangle
   */
  static rectContains(px, py, rx, ry, rw, rh) {
    return px >= rx - rw / 2 && px <= rx + rw / 2 && 
           py >= ry - rh / 2 && py <= ry + rh / 2;
  }
  
  /**
   * Checks if a point is inside a circle
   * @param {number} px - Point X coordinate
   * @param {number} py - Point Y coordinate
   * @param {number} cx - Circle center X coordinate
   * @param {number} cy - Circle center Y coordinate
   * @param {number} r - Circle radius
   * @returns {boolean} True if the point is inside the circle
   */
  static circleContains(px, py, cx, cy, r) {
    return this.distance(px, py, cx, cy) <= r;
  }
  
  /**
   * Checks if two rectangles are colliding
   * @param {number} x1 - First rectangle center X
   * @param {number} y1 - First rectangle center Y
   * @param {number} w1 - First rectangle width
   * @param {number} h1 - First rectangle height
   * @param {number} x2 - Second rectangle center X
   * @param {number} y2 - Second rectangle center Y
   * @param {number} w2 - Second rectangle width
   * @param {number} h2 - Second rectangle height
   * @returns {boolean} True if the rectangles are colliding
   */
  static rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return Math.abs(x1 - x2) < (w1 / 2 + w2 / 2) && 
           Math.abs(y1 - y2) < (h1 / 2 + h2 / 2);
  }
  
  /**
   * Checks if two circles are colliding
   * @param {number} x1 - First circle center X
   * @param {number} y1 - First circle center Y
   * @param {number} r1 - First circle radius
   * @param {number} x2 - Second circle center X
   * @param {number} y2 - Second circle center Y
   * @param {number} r2 - Second circle radius
   * @returns {boolean} True if the circles are colliding
   */
  static circleIntersect(x1, y1, r1, x2, y2, r2) {
    return this.distance(x1, y1, x2, y2) < (r1 + r2);
  }
  
  /**
   * Formats time in seconds to MM:SS.mm format
   * @param {number} time - Time in seconds
   * @returns {string} Formatted time string
   */
  static formatTime(time) {
    if (time === Infinity || isNaN(time)) {
      return '--:--:--';
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Easing function for smooth transitions (quad ease out)
   * @param {number} t - Input value (0-1)
   * @returns {number} Eased value
   */
  static easeOut(t) {
    return 1 - (1 - t) * (1 - t);
  }
  
  /**
   * Easing function for smooth transitions (quad ease in)
   * @param {number} t - Input value (0-1)
   * @returns {number} Eased value
   */
  static easeIn(t) {
    return t * t;
  }
  
  /**
   * Easing function for smooth transitions (quad ease in-out)
   * @param {number} t - Input value (0-1)
   * @returns {number} Eased value
   */
  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  
  /**
   * Normalizes an angle to the range [0, 2π)
   * @param {number} angle - Angle in radians
   * @returns {number} Normalized angle
   */
  static normalizeAngle(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }
  
  /**
   * Gets the shortest angle between two angles
   * @param {number} a - First angle in radians
   * @param {number} b - Second angle in radians
   * @returns {number} Shortest angle difference
   */
  static angleDifference(a, b) {
    const diff = (b - a + Math.PI) % (2 * Math.PI) - Math.PI;
    return diff < -Math.PI ? diff + 2 * Math.PI : diff;
  }
  
  /**
   * Linear interpolation between two angles
   * @param {number} a - First angle in radians
   * @param {number} b - Second angle in radians
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated angle
   */
  static lerpAngle(a, b, t) {
    const diff = this.angleDifference(a, b);
    return a + diff * t;
  }
  
  /**
   * Rotates a point around another point
   * @param {number} x - Point X coordinate
   * @param {number} y - Point Y coordinate
   * @param {number} cx - Center X coordinate
   * @param {number} cy - Center Y coordinate
   * @param {number} angle - Angle in radians
   * @returns {Object} Rotated point {x, y}
   */
  static rotatePoint(x, y, cx, cy, angle) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    
    // Translate point back to origin
    const dx = x - cx;
    const dy = y - cy;
    
    // Rotate point
    const nx = dx * c - dy * s;
    const ny = dx * s + dy * c;
    
    // Translate point back
    return {
      x: nx + cx,
      y: ny + cy
    };
  }
  
  /**
   * Gets a point on a bezier curve
   * @param {number} t - Parameter (0-1)
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - Control point 1 X
   * @param {number} y2 - Control point 1 Y
   * @param {number} x3 - Control point 2 X
   * @param {number} y3 - Control point 2 Y
   * @param {number} x4 - End X
   * @param {number} y4 - End Y
   * @returns {Object} Point on curve {x, y}
   */
  static bezierPoint(t, x1, y1, x2, y2, x3, y3, x4, y4) {
    const t1 = 1 - t;
    const t2 = t1 * t1;
    const t3 = t2 * t1;
    const s1 = t * t;
    const s2 = s1 * t;
    
    const x = t3 * x1 + 3 * t2 * t * x2 + 3 * t1 * s1 * x3 + s2 * x4;
    const y = t3 * y1 + 3 * t2 * t * y2 + 3 * t1 * s1 * y3 + s2 * y4;
    
    return { x, y };
  }
  
  /**
   * Gets a color halfway between two colors
   * @param {Array} color1 - First color [r, g, b, a]
   * @param {Array} color2 - Second color [r, g, b, a]
   * @param {number} amount - Blend amount (0-1)
   * @returns {Array} Blended color [r, g, b, a]
   */
  static lerpColor(color1, color2, amount) {
    const r = Math.round(this.lerp(color1[0], color2[0], amount));
    const g = Math.round(this.lerp(color1[1], color2[1], amount));
    const b = Math.round(this.lerp(color1[2], color2[2], amount));
    const a = color1.length > 3 && color2.length > 3 ? 
      this.lerp(color1[3], color2[3], amount) : 1;
    
    return [r, g, b, a];
  }
  
  /**
   * Converts a color to a CSS rgba string
   * @param {Array} color - Color array [r, g, b, a]
   * @returns {string} CSS rgba string
   */
  static colorToString(color) {
    const r = color[0];
    const g = color[1];
    const b = color[2];
    const a = color.length > 3 ? color[3] : 1;
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  
  /**
   * Gets a random color
   * @param {number} alpha - Alpha value (0-1)
   * @returns {Array} Random color [r, g, b, a]
   */
  static randomColor(alpha = 1) {
    return [
      this.randomInt(0, 255),
      this.randomInt(0, 255),
      this.randomInt(0, 255),
      alpha
    ];
  }
}

// Export the helpers for global use
window.Helpers = Helpers; 