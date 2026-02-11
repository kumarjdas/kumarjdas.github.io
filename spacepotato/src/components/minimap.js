/**
 * minimap.js
 * Minimap component that displays the race track and player positions
 */

class Minimap {
  /**
   * Create a new minimap component
   * @param {Object} options - Minimap options
   * @param {number} options.width - Width of the minimap
   * @param {number} options.height - Height of the minimap
   * @param {number} options.x - X position of the minimap
   * @param {number} options.y - Y position of the minimap
   */
  constructor(options) {
    // Ensure options is an object
    options = options || {};
    
    // Position and size with defaults
    this.width = options.width || 200;
    this.height = options.height || 150;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.padding = 10;
    
    // Track reference
    this.track = null;
    
    // Scaling and bounds
    this.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    this.scale = 1;
    this.calculatedScale = 1;
    
    // Calculate minimap scale and bounds
    if (options.track) {
      this.setTrack(options.track);
    }
  }
  
  /**
   * Set the track for the minimap
   * @param {Object} track - The track to display
   */
  setTrack(track) {
    if (!track) return;
    
    this.track = track;
    this.updateBounds();
  }
  
  /**
   * Update the minimap bounds based on the track
   */
  updateBounds() {
    if (!this.track || !this.track.boundaries || this.track.boundaries.length === 0) {
      return;
    }
    
    // Find track bounds
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    // Check outer boundaries
    for (const boundary of this.track.boundaries) {
      for (const point of boundary.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
    }
    
    // Add some padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    // Store bounds
    this.bounds = { minX, minY, maxX, maxY };
    
    // Calculate scale to fit track in minimap
    const trackWidth = maxX - minX;
    const trackHeight = maxY - minY;
    const scaleX = (this.width - this.padding * 2) / trackWidth;
    const scaleY = (this.height - this.padding * 2) / trackHeight;
    
    // Use the smaller scale to ensure entire track fits
    this.calculatedScale = Math.min(scaleX, scaleY);
  }
  
  /**
   * Resize the minimap when the window size changes
   */
  resize() {
    this.x = this.game.width - 220;
    this.y = this.game.height - 170;
  }
  
  /**
   * Update the minimap
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime) {
    // Update bounds if track changes
    if (this.track && (!this.bounds || this.bounds.minX === Infinity)) {
      this.updateBounds();
    }
  }
  
  /**
   * Draw the minimap
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Array} players - Array of player objects
   * @param {Object} track - Track object (optional, uses this.track if not provided)
   */
  draw(ctx, players, track) {
    try {
      if (track && !this.track) {
        this.setTrack(track);
      }
      
      // Save context state
      ctx.save();
      
      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw border
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      
      // Draw track
      this.drawTrack(ctx);
      
      // Draw players
      if (Array.isArray(players)) {
        this.drawPlayers(ctx, players);
      }
      
      // Restore context
      ctx.restore();
    } catch (e) {
      console.error("Error drawing minimap:", e);
      
      // Fallback - draw simple minimap outline
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Arial';
      ctx.fillText('MINIMAP', this.x + this.width/2, this.y + this.height/2);
      ctx.restore();
    }
  }
  
  /**
   * Draw the track on the minimap
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  drawTrack(ctx) {
    try {
      if (!this.track || !this.track.boundaries) {
        return;
      }
      
      // Draw outer boundaries
      ctx.beginPath();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1;
      
      for (const boundary of this.track.boundaries) {
        if (!boundary || !boundary.points || !Array.isArray(boundary.points)) {
          continue;
        }
        
        const scaledPoints = boundary.points.map(point => this.worldToMinimap(point));
        
        // Draw the boundary as a line
        if (scaledPoints.length > 0) {
          ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
          for (let i = 1; i < scaledPoints.length; i++) {
            ctx.lineTo(scaledPoints[i].x, scaledPoints[i].y);
          }
          
          // Close the path if it's a closed boundary
          if (boundary.closed) {
            ctx.lineTo(scaledPoints[0].x, scaledPoints[0].y);
          }
        }
      }
      
      ctx.stroke();
      
      // Draw checkpoints if available
      if (this.track.checkpoints && Array.isArray(this.track.checkpoints)) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        
        for (const checkpoint of this.track.checkpoints) {
          if (!checkpoint || !checkpoint.start || !checkpoint.end) {
            continue;
          }
          
          const startPoint = this.worldToMinimap(checkpoint.start);
          const endPoint = this.worldToMinimap(checkpoint.end);
          
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
        }
        
        ctx.stroke();
      }
      
      // Draw start/finish line if available
      if (this.track.startLine && this.track.startLine.start && this.track.startLine.end) {
        ctx.beginPath();
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        
        const startPoint = this.worldToMinimap(this.track.startLine.start);
        const endPoint = this.worldToMinimap(this.track.startLine.end);
        
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        
        ctx.stroke();
      }
    } catch (e) {
      console.error("Error drawing track on minimap:", e);
    }
  }
  
  /**
   * Draw players on the minimap
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {Array} players - Array of player objects
   */
  drawPlayers(ctx, players) {
    try {
      if (!Array.isArray(players)) {
        return;
      }
      
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (!player || !player.potato || !player.potato.position) {
          continue;
        }
        
        // Get minimap coordinates for player
        const { x, y } = this.worldToMinimap(player.potato.position);
        
        // Player dot size
        const dotSize = 4;
        
        // Use player color if available, otherwise use default colors
        const playerColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        const color = player.color || playerColors[i % playerColors.length];
        
        // Draw player dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator if rotation available
        if (player.potato.rotation !== undefined) {
          const directionLength = dotSize * 2;
          const endX = x + Math.cos(player.potato.rotation) * directionLength;
          const endY = y + Math.sin(player.potato.rotation) * directionLength;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    } catch (e) {
      console.error("Error drawing players on minimap:", e);
    }
  }
  
  /**
   * Convert world coordinates to minimap coordinates
   * @param {Object} point - World coordinate point {x, y}
   * @returns {Object} Minimap coordinate point {x, y}
   */
  worldToMinimap(point) {
    try {
      if (!point || point.x === undefined || point.y === undefined) {
        return { x: this.x, y: this.y };
      }
      
      if (!this.bounds) {
        // Default bounds if not set
        this.bounds = {
          minX: 0,
          minY: 0,
          maxX: 1000,
          maxY: 1000
        };
      }
      
      // Calculate scale factors
      const worldWidth = this.bounds.maxX - this.bounds.minX;
      const worldHeight = this.bounds.maxY - this.bounds.minY;
      
      // Avoid division by zero
      const scaleX = worldWidth === 0 ? 1 : this.width / worldWidth;
      const scaleY = worldHeight === 0 ? 1 : this.height / worldHeight;
      
      // Scale and translate the point
      const x = this.x + (point.x - this.bounds.minX) * scaleX;
      const y = this.y + (point.y - this.bounds.minY) * scaleY;
      
      return { x, y };
    } catch (e) {
      console.error("Error converting world coordinates to minimap:", e);
      return { x: this.x, y: this.y };
    }
  }
  
  /**
   * Convert minimap coordinates to world coordinates
   * @param {number} mapX - X coordinate in minimap space
   * @param {number} mapY - Y coordinate in minimap space
   * @returns {Object} Coordinates in world space {x, y}
   */
  minimapToWorld(mapX, mapY) {
    return {
      x: (mapX - this.x - this.padding) / this.calculatedScale + this.bounds.minX,
      y: (mapY - this.y - this.padding) / this.calculatedScale + this.bounds.minY
    };
  }
  
  /**
   * Check if a point is inside the minimap
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if the point is inside the minimap
   */
  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
} 