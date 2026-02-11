/**
 * track.js
 * Racing track for the game
 */

class Track {
  /**
   * Create a new racing track
   * @param {Array} trackData - Track boundary points and properties
   */
  constructor(trackData) {
    // Ensure window.CONFIG exists to avoid "Cannot access 'CONFIG' before initialization" errors
    this.initConfig();
    
    // Track boundaries
    this.innerBoundary = trackData.innerBoundary || [];
    this.outerBoundary = trackData.outerBoundary || [];
    
    // Track properties
    this.name = trackData.name || "Track";
    this.backgroundColor = trackData.backgroundColor || "#7EC850"; // Green grass
    this.trackColor = trackData.trackColor || "#555555"; // Dark asphalt
    
    // Track elements
    this.checkpoints = trackData.checkpoints || [];
    this.startPosition = trackData.startPosition || { x: 0, y: 0 };
    this.startAngle = trackData.startAngle || 0;
    this.obstacles = trackData.obstacles || [];
    this.terrainPatches = trackData.terrainPatches || [];
    this.decorations = trackData.decorations || [];
    
    // Prepare boundary segments for collision detection
    this.innerBoundarySegments = this.createBoundarySegments(this.innerBoundary);
    this.outerBoundarySegments = this.createBoundarySegments(this.outerBoundary);
    
    // Store starting positions for up to 4 players
    this.startPositions = this.generateStartPositions();
    
    // Create checkpoint hitboxes
    this.checkpointHitboxes = this.createCheckpointHitboxes();
  }
  
  /**
   * Initialize CONFIG global if it doesn't exist
   */
  initConfig() {
    if (typeof window.CONFIG === 'undefined') {
      console.warn("CONFIG not found, initializing with defaults");
      window.CONFIG = {
        DEBUG: {
          SHOW_CHECKPOINTS: false,
          SHOW_UNKNOWN_DECORATIONS: false,
          SHOW_UNKNOWN_OBSTACLES: false
        },
        TERRAIN: {
          ASPHALT: {
            id: 'asphalt',
            friction: 0.1,
            grip: 1.0,
            color: '#555555'
          },
          GRASS: {
            id: 'grass',
            friction: 0.3,
            grip: 0.7,
            color: '#7EC850'
          },
          MUD: {
            id: 'mud',
            friction: 0.5,
            grip: 0.4,
            color: '#8B4513'
          },
          ICE: {
            id: 'ice',
            friction: 0.05,
            grip: 0.3,
            color: '#A5F2F3'
          },
          OIL: {
            id: 'oil',
            friction: 0.7,
            grip: 0.2,
            color: '#000000'
          }
        }
      };
    }
    
    // Ensure CONFIG.TERRAIN exists
    if (!window.CONFIG.TERRAIN) {
      console.warn("CONFIG.TERRAIN not found, initializing with defaults");
      window.CONFIG.TERRAIN = {
        ASPHALT: { id: 'asphalt', friction: 0.1, grip: 1.0, color: '#555555' },
        GRASS: { id: 'grass', friction: 0.3, grip: 0.7, color: '#7EC850' }
      };
    }
    
    // Ensure CONFIG.DEBUG exists
    if (!window.CONFIG.DEBUG) {
      console.warn("CONFIG.DEBUG not found, initializing with defaults");
      window.CONFIG.DEBUG = {
        SHOW_CHECKPOINTS: false,
        SHOW_UNKNOWN_DECORATIONS: false,
        SHOW_UNKNOWN_OBSTACLES: false
      };
    }
  }
  
  /**
   * Convert boundary points into line segments
   * @param {Array} boundary - Boundary points
   * @returns {Array} Array of line segments
   */
  createBoundarySegments(boundary) {
    const segments = [];
    
    if (boundary.length < 2) return segments;
    
    for (let i = 0; i < boundary.length; i++) {
      const startPoint = boundary[i];
      const endPoint = boundary[(i + 1) % boundary.length]; // Loop back to start for the last segment
      
      segments.push({
        start: { x: startPoint.x, y: startPoint.y },
        end: { x: endPoint.x, y: endPoint.y }
      });
    }
    
    return segments;
  }
  
  /**
   * Generate starting positions for multiple players
   * @returns {Array} Array of starting positions and angles
   */
  generateStartPositions() {
    const positions = [];
    
    // Get direction vector based on start angle
    const angleRad = this.startAngle * (Math.PI / 180);
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    
    // Perpendicular direction for player spread
    const perpX = -dirY;
    const perpY = dirX;
    
    // Generate 4 positions in a grid (2x2)
    // Front row (positions 0 and 1)
    positions.push({
      position: {
        x: this.startPosition.x - perpX * 25,
        y: this.startPosition.y - perpY * 25
      },
      angle: this.startAngle
    });
    
    positions.push({
      position: {
        x: this.startPosition.x + perpX * 25,
        y: this.startPosition.y + perpY * 25
      },
      angle: this.startAngle
    });
    
    // Back row (positions 2 and 3)
    positions.push({
      position: {
        x: this.startPosition.x - perpX * 25 - dirX * 50,
        y: this.startPosition.y - perpY * 25 - dirY * 50
      },
      angle: this.startAngle
    });
    
    positions.push({
      position: {
        x: this.startPosition.x + perpX * 25 - dirX * 50,
        y: this.startPosition.y + perpY * 25 - dirY * 50
      },
      angle: this.startAngle
    });
    
    return positions;
  }
  
  /**
   * Create hitboxes for checkpoints
   * @returns {Array} Array of checkpoint hitboxes
   */
  createCheckpointHitboxes() {
    return this.checkpoints.map((checkpoint, index) => {
      // Create a line segment for the checkpoint
      const width = checkpoint.width || 50;
      const angle = checkpoint.angle || 0;
      
      // Calculate endpoints based on center, width, and angle
      const angleRad = angle * (Math.PI / 180);
      const halfWidth = width / 2;
      
      const point1 = {
        x: checkpoint.x - Math.cos(angleRad) * halfWidth,
        y: checkpoint.y - Math.sin(angleRad) * halfWidth
      };
      
      const point2 = {
        x: checkpoint.x + Math.cos(angleRad) * halfWidth,
        y: checkpoint.y + Math.sin(angleRad) * halfWidth
      };
      
      return {
        start: point1,
        end: point2,
        index: index,
        isFinishLine: index === 0
      };
    });
  }
  
  /**
   * Check if a point overlaps with a checkpoint
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Collision radius
   * @returns {Object} Checkpoint collision data
   */
  checkCheckpoint(x, y, radius) {
    for (const checkpoint of this.checkpointHitboxes) {
      // Check if the point is close to the checkpoint line segment
      const distance = this.pointToLineDistance(
        { x, y }, 
        checkpoint.start, 
        checkpoint.end
      );
      
      if (distance < radius) {
        return {
          hit: true,
          index: checkpoint.index,
          isFinishLine: checkpoint.isFinishLine
        };
      }
    }
    
    return { hit: false };
  }
  
  /**
   * Check for collision with track boundaries
   * @param {Sprite} sprite - The sprite to check collisions for
   * @returns {Object} Collision data
   */
  checkBoundaryCollision(sprite) {
    const segments = [...this.innerBoundarySegments, ...this.outerBoundarySegments];
    let closestCollision = {
      colliding: false,
      normal: { x: 0, y: 0 },
      overlap: 0
    };
    
    // Check each boundary segment
    for (const segment of segments) {
      // Calculate collision with the circle sprite
      const collision = this.lineCircleCollision(
        segment.start,
        segment.end,
        sprite.position,
        sprite.collider.radius
      );
      
      if (collision.colliding && (
        !closestCollision.colliding || 
        collision.overlap > closestCollision.overlap
      )) {
        closestCollision = collision;
      }
    }
    
    return closestCollision;
  }
  
  /**
   * Calculate distance from a point to a line segment
   * @param {Object} point - Point coordinates
   * @param {Object} lineStart - Line start coordinates
   * @param {Object} lineEnd - Line end coordinates
   * @returns {number} Distance from point to line
   */
  pointToLineDistance(point, lineStart, lineEnd) {
    try {
      // Safety checks for undefined values
      if (!point || !lineStart || !lineEnd) return Infinity;
      if (point.x === undefined || point.y === undefined) return Infinity;
      if (lineStart.x === undefined || lineStart.y === undefined) return Infinity;
      if (lineEnd.x === undefined || lineEnd.y === undefined) return Infinity;
      
      const A = point.x - lineStart.x;
      const B = point.y - lineStart.y;
      const C = lineEnd.x - lineStart.x;
      const D = lineEnd.y - lineStart.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) {
        param = dot / lenSq;
      }

      let xx, yy;

      if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
      } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
      } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
      }

      const dx = point.x - xx;
      const dy = point.y - yy;
      
      return Math.sqrt(dx * dx + dy * dy);
    } catch (err) {
      console.error("Error in pointToLineDistance:", err);
      return Infinity;
    }
  }
  
  /**
   * Check for collision between a line segment and a circle
   * @param {Object} lineStart - Line start coordinates
   * @param {Object} lineEnd - Line end coordinates
   * @param {Object} circlePos - Circle center coordinates
   * @param {number} radius - Circle radius
   * @returns {Object} Collision data
   */
  lineCircleCollision(lineStart, lineEnd, circlePos, radius) {
    const distance = this.pointToLineDistance(circlePos, lineStart, lineEnd);
    
    if (distance >= radius) {
      return {
        colliding: false
      };
    }
    
    // Calculate the normal vector from the line to the circle
    // First, find the closest point on the line
    const A = circlePos.x - lineStart.x;
    const B = circlePos.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let closestPoint = { x: 0, y: 0 };
    
    if (param < 0) {
      closestPoint.x = lineStart.x;
      closestPoint.y = lineStart.y;
    } else if (param > 1) {
      closestPoint.x = lineEnd.x;
      closestPoint.y = lineEnd.y;
    } else {
      closestPoint.x = lineStart.x + param * C;
      closestPoint.y = lineStart.y + param * D;
    }
    
    // Calculate the normal vector from the line to the circle
    const normalX = circlePos.x - closestPoint.x;
    const normalY = circlePos.y - closestPoint.y;
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
    
    // Normalize the normal vector
    const normalizedX = normalX / normalLength;
    const normalizedY = normalY / normalLength;
    
    return {
      colliding: true,
      normal: {
        x: normalizedX,
        y: normalizedY
      },
      overlap: radius - distance,
      point: closestPoint
    };
  }
  
  /**
   * Get terrain type at a specific position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object} Terrain type
   */
  getTerrainAt(x, y) {
    try {
      // Check if CONFIG is available
      if (!window.CONFIG || !CONFIG.TERRAIN) {
        return { 
          id: 'asphalt',
          friction: 0.1, 
          grip: 1.0, 
          color: '#555555' 
        };
      }
      
      // Default terrain is asphalt (track)
      let terrain = CONFIG.TERRAIN.ASPHALT || { 
        id: 'asphalt',
        friction: 0.1, 
        grip: 1.0, 
        color: '#555555' 
      };
      
      // Check if the point is outside the track (off-road)
      if (this.isPointOutsideTrack(x, y)) {
        terrain = CONFIG.TERRAIN.GRASS || { 
          id: 'grass',
          friction: 0.3, 
          grip: 0.7, 
          color: '#7EC850' 
        };
      }
      
      // Check terrain patches (mud, oil, ice, etc)
      if (Array.isArray(this.terrainPatches)) {
        for (const patch of this.terrainPatches) {
          if (this.isPointInPatch(x, y, patch)) {
            // Get terrain type from config
            const patchTerrainType = patch.type || 'asphalt';
            const patchTerrain = CONFIG.TERRAIN[patchTerrainType] || CONFIG.TERRAIN.ASPHALT || terrain;
            terrain = patchTerrain;
            break;
          }
        }
      }
      
      return terrain;
    } catch (e) {
      console.error("Error in getTerrainAt:", e);
      // Return default terrain in case of error
      return { 
        id: 'asphalt',
        friction: 0.1, 
        grip: 1.0, 
        color: '#555555' 
      };
    }
  }
  
  /**
   * Check if a point is inside a terrain patch
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} patch - Terrain patch data
   * @returns {boolean} Whether the point is in the patch
   */
  isPointInPatch(x, y, patch) {
    // Circle patch
    if (patch.shape === 'circle') {
      const distX = x - patch.x;
      const distY = y - patch.y;
      const distSq = distX * distX + distY * distY;
      
      return distSq < patch.radius * patch.radius;
    }
    
    // Rectangle patch
    else if (patch.shape === 'rect') {
      // Handle rotation if specified
      if (patch.angle) {
        // Translate point to origin
        const transX = x - patch.x;
        const transY = y - patch.y;
        
        // Rotate point
        const angleRad = -patch.angle * (Math.PI / 180);
        const rotX = transX * Math.cos(angleRad) - transY * Math.sin(angleRad);
        const rotY = transX * Math.sin(angleRad) + transY * Math.cos(angleRad);
        
        // Check if rotated point is in rectangle
        return (
          rotX >= -patch.width / 2 &&
          rotX <= patch.width / 2 &&
          rotY >= -patch.height / 2 &&
          rotY <= patch.height / 2
        );
      }
      
      // No rotation
      return (
        x >= patch.x - patch.width / 2 &&
        x <= patch.x + patch.width / 2 &&
        y >= patch.y - patch.height / 2 &&
        y <= patch.y + patch.height / 2
      );
    }
    
    // Polygon patch
    else if (patch.shape === 'polygon' && patch.points) {
      return this.isPointInPolygon(x, y, patch.points);
    }
    
    return false;
  }
  
  /**
   * Check if a point is inside a polygon
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Array} polygon - Array of {x, y} points forming the polygon
   * @returns {boolean} Whether the point is inside the polygon
   */
  isPointInPolygon(x, y, polygon) {
    try {
      // Check for valid inputs
      if (typeof x !== 'number' || typeof y !== 'number' || 
          !polygon || !Array.isArray(polygon) || polygon.length < 3) {
        return false;
      }
      
      let inside = false;
      
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        // Ensure polygon points have valid x,y properties
        if (!polygon[i] || typeof polygon[i].x !== 'number' || typeof polygon[i].y !== 'number' ||
            !polygon[j] || typeof polygon[j].x !== 'number' || typeof polygon[j].y !== 'number') {
          continue; // Skip invalid points
        }
        
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;
        
        // Avoid division by zero
        if (yi === yj) continue;
        
        const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          
        if (intersect) inside = !inside;
      }
      
      return inside;
    } catch (err) {
      console.error('Error in isPointInPolygon:', err);
      return false; // Default to outside in case of error
    }
  }
  
  /**
   * Check if a point is outside the track
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {boolean} True if point is outside the track
   */
  isPointOutsideTrack(x, y) {
    try {
      // Ensure coordinates are valid numbers
      if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        return true; // Consider invalid coordinates as outside the track
      }
      
      // Check if boundaries exist
      if (!this.outerBoundary || !Array.isArray(this.outerBoundary) || this.outerBoundary.length < 3) {
        return false; // If no valid outer boundary, assume inside track
      }
      
      // A point is outside the track if it's outside the outer boundary
      // or inside the inner boundary
      const outsideOuter = !this.isPointInPolygon(x, y, this.outerBoundary);
      
      // Only check inner boundary if it exists and is valid
      let insideInner = false;
      if (this.innerBoundary && Array.isArray(this.innerBoundary) && this.innerBoundary.length >= 3) {
        insideInner = this.isPointInPolygon(x, y, this.innerBoundary);
      }
      
      return outsideOuter || insideInner;
    } catch (err) {
      console.error('Error in isPointOutsideTrack:', err);
      return false; // Assume inside track in case of error
    }
  }
  
  /**
   * Draw the track
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Object} camera - Camera for transform
   */
  draw(ctx, camera) {
    try {
      // Save context state
      ctx.save();
      
      // Apply camera transform if available
      if (camera && typeof camera.begin === 'function') {
        // If camera has begin method, use it instead of manually transforming
        camera.begin(ctx);
      } else if (camera) {
        // Manual camera transform (fallback)
        ctx.translate(camera.position.x || 0, camera.position.y || 0);
        if (camera.zoom) {
          ctx.scale(camera.zoom, camera.zoom);
        }
      }
      
      // Draw background
      ctx.fillStyle = this.backgroundColor || '#7EC850';
      ctx.fillRect(-10000, -10000, 20000, 20000); // Large background
      
      // Draw track surface
      ctx.fillStyle = this.trackColor || '#555555';
      
      // Draw main track from outer boundary
      if (this.outerBoundary && this.outerBoundary.length > 2) {
        this.drawPolygon(ctx, this.outerBoundary);
        
        // Draw inner boundary (hole) if it exists
        if (this.innerBoundary && this.innerBoundary.length > 2) {
          // We need to cut out the inner boundary
          ctx.globalCompositeOperation = 'destination-out';
          this.drawPolygon(ctx, this.innerBoundary);
          ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        // Fallback - draw simple track
        ctx.fillRect(-200, -200, 400, 400);
      }
      
      // Draw checkpoints
      this.drawCheckpoints(ctx);
      
      // Draw terrain patches
      this.drawTerrainPatches(ctx);
      
      // Draw decorations and obstacles in proper order
      this.drawDecorations(ctx, 'background');
      this.drawObstacles(ctx);
      this.drawDecorations(ctx, 'foreground');
      
      // Restore context
      if (camera && typeof camera.end === 'function') {
        camera.end(ctx);
      } else {
        ctx.restore();
      }
    } catch (e) {
      console.error("Error drawing track:", e);
      
      // Restore context in case of error
      ctx.restore();
      
      // Draw fallback track
      ctx.save();
      ctx.fillStyle = '#7EC850'; // Green background
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.fillStyle = '#555555'; // Track color
      ctx.fillRect(100, 100, 600, 400);
      ctx.restore();
    }
  }
  
  /**
   * Draw a polygon
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Array} polygon - Array of polygon points
   */
  drawPolygon(ctx, polygon) {
    if (!polygon || polygon.length < 3) return;
    
    ctx.beginPath();
    
    for (const point of polygon) {
      ctx.lineTo(point.x, point.y);
    }
    
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Draw checkpoints
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawCheckpoints(ctx) {
    try {
      // Make sure checkpointHitboxes exists and is an array
      if (!this.checkpointHitboxes || !Array.isArray(this.checkpointHitboxes)) {
        return;
      }
      
      // Create local reference to CONFIG that's safe to use
      const CONFIG_DEBUG = (window.CONFIG && CONFIG.DEBUG) ? CONFIG.DEBUG : {
        SHOW_CHECKPOINTS: false
      };
      
      for (let i = 0; i < this.checkpointHitboxes.length; i++) {
        const checkpoint = this.checkpointHitboxes[i];
        
        // Skip if checkpoint or its coordinates are invalid
        if (!checkpoint || 
            !checkpoint.start || checkpoint.start.x === undefined || checkpoint.start.y === undefined ||
            !checkpoint.end || checkpoint.end.x === undefined || checkpoint.end.y === undefined) {
          continue;
        }
        
        // Style based on checkpoint type
        if (checkpoint.isFinishLine) {
          // Finish line (alternating black and white)
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 8;
          
          const segments = 8; // Number of segments
          const dx = (checkpoint.end.x - checkpoint.start.x) / segments;
          const dy = (checkpoint.end.y - checkpoint.start.y) / segments;
          
          for (let j = 0; j < segments; j++) {
            if (j % 2 === 0) {
              ctx.strokeStyle = 'black';
            } else {
              ctx.strokeStyle = 'white';
            }
            
            const x1 = checkpoint.start.x + j * dx;
            const y1 = checkpoint.start.y + j * dy;
            const x2 = checkpoint.start.x + (j + 1) * dx;
            const y2 = checkpoint.start.y + (j + 1) * dy;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        } else {
          // Regular checkpoint
          if (CONFIG_DEBUG.SHOW_CHECKPOINTS) {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(
              checkpoint.start.x, 
              checkpoint.start.y
            );
            ctx.lineTo(
              checkpoint.end.x, 
              checkpoint.end.y
            );
            ctx.stroke();
            
            // Checkpoint number
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const centerX = (checkpoint.start.x + checkpoint.end.x) / 2;
            const centerY = (checkpoint.start.y + checkpoint.end.y) / 2;
            ctx.fillText(i.toString(), centerX, centerY);
          }
        }
      }
    } catch (err) {
      console.error("Error drawing checkpoints:", err);
    }
  }
  
  /**
   * Draw terrain patches
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawTerrainPatches(ctx) {
    try {
      if (!this.terrainPatches || !Array.isArray(this.terrainPatches) || this.terrainPatches.length === 0) {
        return;
      }

      // Create a safe reference to terrain types with defaults
      const terrainTypes = (window.CONFIG && CONFIG.TERRAIN) ? CONFIG.TERRAIN : {
        ASPHALT: { color: '#555555' }
      };
      
      // Draw terrain patches
      for (const patch of this.terrainPatches) {
        if (!patch || !patch.shape) continue;
        
        // Get terrain color from config with fallback
        const defaultTerrain = { color: '#555555' }; // Default asphalt color
        const terrainType = patch.type || 'ASPHALT';
        const terrain = terrainTypes[terrainType] || terrainTypes.ASPHALT || defaultTerrain;
        
        ctx.fillStyle = terrain.color;
        ctx.beginPath();
        
        // Draw based on shape
        if (patch.shape === 'circle') {
          if (typeof patch.x === 'number' && typeof patch.y === 'number' && 
              typeof patch.radius === 'number') {
            ctx.arc(patch.x, patch.y, patch.radius * 2, 0, Math.PI * 2);
          }
        } 
        else if (patch.shape === 'rect') {
          if (typeof patch.x === 'number' && typeof patch.y === 'number' && 
              typeof patch.width === 'number' && typeof patch.height === 'number') {
            ctx.rect(
              patch.x - patch.width / 2,
              patch.y - patch.height / 2,
              patch.width,
              patch.height
            );
          }
        }
        else if (patch.shape === 'polygon' && patch.points && Array.isArray(patch.points)) {
          ctx.beginPath();
          let validPoints = true;
          
          for (const point of patch.points) {
            if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
              validPoints = false;
              break;
            }
            ctx.lineTo(point.x, point.y);
          }
          
          if (validPoints) {
            ctx.closePath();
          } else {
            // Skip invalid polygon
            continue;
          }
        }
        
        ctx.fill();
      }
    } catch (err) {
      console.error("Error drawing terrain patches:", err);
    }
  }
  
  /**
   * Draw track decorations
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {string} layer - 'above' or 'below' the track
   */
  drawDecorations(ctx, layer) {
    try {
      if (!this.decorations || !Array.isArray(this.decorations) || this.decorations.length === 0) {
        return;
      }
      
      // Create a safe reference to debug settings with defaults
      const debugSettings = (window.CONFIG && CONFIG.DEBUG) ? CONFIG.DEBUG : {
        SHOW_UNKNOWN_DECORATIONS: false
      };
      
      // Create a safe reference to the Helpers utility
      const randomHelper = {
        random: (min, max) => min + Math.random() * (max - min),
        randomInt: (min, max) => Math.floor(min + Math.random() * (max - min + 1))
      };
      
      // Use window.Helpers if available, otherwise use our local helper
      const Helpers = window.Helpers || randomHelper;
      
      for (const decoration of this.decorations) {
        // Skip if decoration is invalid or not on the right layer
        if (!decoration || decoration.layer !== layer) continue;
        
        // Skip if coordinates are invalid
        if (typeof decoration.x !== 'number' || typeof decoration.y !== 'number') continue;
        
        ctx.save();
        ctx.translate(decoration.x, decoration.y);
        
        if (decoration.angle) {
          ctx.rotate(decoration.angle * (Math.PI / 180));
        }
        
        switch (decoration.type) {
          case 'tree':
            // Draw tree trunk
            ctx.fillStyle = 'brown';
            ctx.fillRect(-5, -5, 10, 20);
            
            // Draw tree foliage
            ctx.fillStyle = 'forestgreen';
            ctx.beginPath();
            ctx.arc(0, -20, 40, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'rock':
            // Draw rock
            ctx.fillStyle = 'gray';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-5, -10);
            ctx.lineTo(10, -8);
            ctx.lineTo(15, 0);
            ctx.lineTo(5, 10);
            ctx.lineTo(-10, 5);
            ctx.closePath();
            ctx.fill();
            break;
            
          case 'bush':
            // Draw bush
            ctx.fillStyle = 'limegreen';
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'grandstand':
            // Draw grandstand (simple bleachers)
            const width = decoration.width || 100;
            const height = decoration.height || 30;
            
            // Draw base
            ctx.fillStyle = 'white';
            ctx.fillRect(-width/2, -height/2, width, height);
            
            // Draw steps
            ctx.fillStyle = 'white';
            const steps = 3;
            const stepWidth = width * 0.9;
            const stepHeight = height * 0.7 / steps;
            
            for (let i = 0; i < steps; i++) {
              ctx.fillRect(
                -stepWidth/2, 
                -height/2 + i * stepHeight, 
                stepWidth, 
                stepHeight
              );
            }
            
            // Draw crowd (random colored dots)
            ctx.fillStyle = 'white';
            const crowdCount = Math.floor(width / 5);
            
            for (let i = 0; i < crowdCount; i++) {
              const personX = Helpers.random(-width/2 + 5, width/2 - 5);
              const personY = Helpers.random(-height/2 + 5, 0);
              
              // Random spectator color
              ctx.fillStyle = `rgb(${Helpers.randomInt(0, 255)}, ${Helpers.randomInt(0, 255)}, ${Helpers.randomInt(0, 255)})`;
              
              ctx.beginPath();
              ctx.arc(personX, personY, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
            
          default:
            // Unknown decoration type
            if (debugSettings.SHOW_UNKNOWN_DECORATIONS) {
              ctx.fillStyle = 'magenta';
              ctx.beginPath();
              ctx.arc(0, 0, 20, 0, Math.PI * 2);
              ctx.fill();
            }
        }
        
        ctx.restore();
      }
    } catch (err) {
      console.error("Error drawing decorations:", err);
    }
  }
  
  /**
   * Draw track obstacles
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawObstacles(ctx) {
    try {
      if (!this.obstacles || !Array.isArray(this.obstacles) || this.obstacles.length === 0) {
        return;
      }
      
      // Create a safe reference to debug settings with defaults
      const debugSettings = (window.CONFIG && CONFIG.DEBUG) ? CONFIG.DEBUG : {
        SHOW_UNKNOWN_OBSTACLES: false
      };
      
      for (const obstacle of this.obstacles) {
        // Skip invalid obstacles
        if (!obstacle || typeof obstacle.x !== 'number' || typeof obstacle.y !== 'number') {
          continue;
        }
        
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);
        
        if (obstacle.angle && typeof obstacle.angle === 'number') {
          ctx.rotate(obstacle.angle * (Math.PI / 180));
        }
        
        switch (obstacle.type) {
          case 'box':
            if (typeof obstacle.width === 'number' && typeof obstacle.height === 'number') {
              ctx.fillStyle = 'brown';
              ctx.strokeStyle = 'black';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.rect(
                -obstacle.width / 2,
                -obstacle.height / 2,
                obstacle.width,
                obstacle.height
              );
              ctx.fill();
              ctx.stroke();
            }
            break;
            
          case 'barrel':
            if (typeof obstacle.radius === 'number') {
              ctx.fillStyle = 'red';
              ctx.strokeStyle = 'black';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(0, 0, obstacle.radius * 2, 0, Math.PI * 2);
              ctx.fill();
              
              // Draw barrel details
              ctx.strokeStyle = 'black';
              ctx.beginPath();
              ctx.arc(0, 0, obstacle.radius * 1.6, 0, Math.PI * 2);
              ctx.stroke();
            }
            break;
            
          case 'cone':
            if (typeof obstacle.width === 'number' && typeof obstacle.height === 'number') {
              // Orange traffic cone
              ctx.fillStyle = 'orange';
              ctx.strokeStyle = 'black';
              ctx.lineWidth = 1;
              
              // Draw cone triangular shape
              ctx.beginPath();
              ctx.moveTo(0, -obstacle.height / 2);
              ctx.lineTo(-obstacle.width / 2, obstacle.height / 2);
              ctx.lineTo(obstacle.width / 2, obstacle.height / 2);
              ctx.closePath();
              ctx.fill();
              
              // Draw base
              ctx.fillStyle = 'white';
              ctx.beginPath();
              ctx.moveTo(-obstacle.width * 0.6 / 2, obstacle.height * 0.4 / 2);
              ctx.lineTo(-obstacle.width * 0.6 / 2, obstacle.height * 0.6 / 2);
              ctx.lineTo(obstacle.width * 0.6 / 2, obstacle.height * 0.6 / 2);
              ctx.closePath();
              ctx.fill();
            }
            break;
            
          default:
            // Unknown obstacle type
            if (debugSettings.SHOW_UNKNOWN_OBSTACLES) {
              ctx.fillStyle = 'red';
              ctx.beginPath();
              ctx.arc(0, 0, 20, 0, Math.PI * 2);
              ctx.fill();
            }
        }
        
        ctx.restore();
      }
    } catch (err) {
      console.error("Error drawing obstacles:", err);
    }
  }
} 