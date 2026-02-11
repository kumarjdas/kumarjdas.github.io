/**
 * raceScene.js
 * Scene for racing gameplay
 */

class RaceScene extends BaseScene {
  /**
   * Create a new race scene
   * @param {Game} game - Reference to the main game object
   * @param {string} name - Scene name
   */
  constructor(game, name = 'race') {
    super(game, name);
    
    // Race state
    this.isRaceStarted = false;
    this.isRaceFinished = false;
    this.countdown = 3;
    this.countdownTimer = 0;
    this.raceTime = 0;
    this.finishDelay = 3000; // Delay before transitioning to results
    
    // Game objects
    this.track = null;
    this.players = [];
    this.camera = null;
    this.powerUps = [];
    this.particleSystems = [];
    this.minimap = null;
    this.ui = null;
    
    // Race results
    this.results = [];
  }
  
  /**
   * Initialize the race scene
   */
  init() {
    super.init();
    
    console.log("RaceScene init called");
    
    // Initialize track
    // Create a simple track if Track class doesn't exist or has issues
    try {
      if (typeof Track === 'function') {
        // Create a simple track data object if none exists
        const trackData = {
          name: "Simple Oval",
          backgroundColor: "#7EC850",
          trackColor: "#555555",
          innerBoundary: [
            { x: 150, y: 150 },
            { x: 650, y: 150 },
            { x: 650, y: 450 },
            { x: 150, y: 450 }
          ],
          outerBoundary: [
            { x: 50, y: 50 },
            { x: 750, y: 50 },
            { x: 750, y: 550 },
            { x: 50, y: 550 }
          ],
          checkpoints: [
            { x: 400, y: 50, angle: 0, width: 100 },
            { x: 750, y: 300, angle: 90, width: 100 },
            { x: 400, y: 550, angle: 0, width: 100 },
            { x: 50, y: 300, angle: 90, width: 100 }
          ],
          startPosition: { x: 400, y: 100 },
          startAngle: 0
        };
        
        this.track = new Track(trackData);
      } else {
        console.warn("Track class not found, using placeholder");
        this.createPlaceholderTrack();
      }
    } catch (e) {
      console.error("Error creating track:", e);
      this.createPlaceholderTrack();
    }
    
    // Define start positions
    let startPositions = [];
    if (this.track && typeof this.track.generateStartPositions === 'function') {
      startPositions = this.track.startPositions;
    } else {
      // Default start positions if track doesn't provide them
      startPositions = [
        { position: { x: 100, y: 200 }, angle: 0 },
        { position: { x: 100, y: 250 }, angle: 0 },
        { position: { x: 100, y: 300 }, angle: 0 },
        { position: { x: 100, y: 350 }, angle: 0 }
      ];
    }
    
    // Initialize players (potatoes)
    this.players = [];
    
    // Add player potato
    const playerType = (this.game.config && this.game.config.selectedPotato) ? 
                       this.game.config.selectedPotato : 'russet';
    
    // Check if Potato class exists
    try {
      if (typeof Potato === 'function') {
        // Create player potato
        const playerStartPos = startPositions[0] || { position: { x: 100, y: 200 }, angle: 0 };
        this.players.push(new Potato({
          type: playerType,
          playerNumber: 1,
          x: playerStartPos.position.x,
          y: playerStartPos.position.y,
          angle: playerStartPos.angle,
          isPlayer: true
        }));
        
        // Add AI potatoes
        const aiTypes = ['russet', 'sweet', 'red', 'purple'];
        const opponentCount = (this.game.config && typeof this.game.config.opponentCount === 'number') ? 
                              this.game.config.opponentCount : 3;
        
        for (let i = 0; i < opponentCount && i < startPositions.length - 1; i++) {
          const aiType = aiTypes[i % aiTypes.length];
          const aiStartPos = startPositions[i + 1] || 
                           { position: { x: 100, y: 250 + i * 50 }, angle: 0 };
          
          this.players.push(new Potato({
            type: aiType,
            playerNumber: i + 2,
            x: aiStartPos.position.x,
            y: aiStartPos.position.y,
            angle: aiStartPos.angle,
            isPlayer: false,
            difficulty: (this.game.config && this.game.config.difficulty) ? 
                        this.game.config.difficulty : 'medium'
          }));
        }
      } else {
        console.warn("Potato class not found, using placeholders");
        this.createPlaceholderPotatoes(startPositions);
      }
    } catch (e) {
      console.error("Error creating potatoes:", e);
      this.createPlaceholderPotatoes(startPositions);
    }
    
    // Initialize camera focused on player
    try {
      if (typeof Camera === 'function') {
        this.camera = new Camera(this.game.canvas.width, this.game.canvas.height);
        if (this.players.length > 0) {
          this.camera.setTarget(this.players[0]);
        }
      } else {
        console.warn("Camera class not found, using placeholder");
        this.createPlaceholderCamera();
      }
    } catch (e) {
      console.error("Error creating camera:", e);
      this.createPlaceholderCamera();
    }
    
    // Initialize power-ups
    this.initializePowerUps();
    
    // Initialize particle systems array
    this.particleSystems = [];
    
    // Initialize minimap
    this.initializeMinimap();
    
    // Initialize UI
    this.initializeUI();
    
    // Reset race state
    this.isRaceStarted = false;
    this.isRaceFinished = false;
    this.countdown = 3;
    this.countdownTimer = 0;
    this.raceTime = 0;
    this.results = [];
    
    // Start countdown - use 3000ms (3 seconds) if config is not available
    this.countdownTimer = (this.game.config && this.game.config.countdownTime) ? 
                           this.game.config.countdownTime : 3000;
    
    // Add race event listeners
    this.addEventListeners();
  }
  
  /**
   * Create a placeholder track when the real Track class is not available
   */
  createPlaceholderTrack() {
    this.track = {
      checkBoundaryCollision: () => ({ colliding: false }),
      getTerrainAt: () => ({ 
        id: 'asphalt',
        friction: 0.1, 
        grip: 1.0, 
        color: '#555555' 
      }),
      updateRaceProgress: () => {},
      checkCheckpoint: () => false,
      draw: (ctx) => {
        ctx.fillStyle = '#7EC850'; // Green grass
        ctx.fillRect(-1000, -1000, 2000, 2000);
        ctx.fillStyle = '#555555'; // Gray track
        ctx.fillRect(-400, -200, 800, 400);
      }
    };
  }
  
  /**
   * Create placeholder potatoes when the real Potato class is not available
   * @param {Array} startPositions - Start positions for potatoes
   */
  createPlaceholderPotatoes(startPositions) {
    for (let i = 0; i < 4 && i < startPositions.length; i++) {
      const pos = startPositions[i] || { position: { x: 100, y: 200 + i * 50 }, angle: 0 };
      this.players.push({
        position: { x: pos.position.x, y: pos.position.y },
        velocity: { x: 0, y: 0 },
        rotation: pos.angle || 0,
        isPlayer: i === 0,
        playerNumber: i + 1,
        collider: { radius: 20 },
        color: i === 0 ? '#A0522D' : ['#8B0000', '#FF8C00', '#800080'][i % 3],
        update: () => {},
        draw: (ctx, camera) => {
          try {
            ctx.save();
            if (camera && typeof camera.worldToScreen === 'function') {
              const screenPos = camera.worldToScreen(pos.position.x, pos.position.y);
              ctx.translate(screenPos.x, screenPos.y);
            } else {
              ctx.translate(pos.position.x, pos.position.y);
            }
            ctx.fillStyle = i === 0 ? '#A0522D' : ['#8B0000', '#FF8C00', '#800080'][i % 3];
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } catch (e) {
            console.error("Error drawing placeholder potato:", e);
            ctx.restore();
          }
        },
        checkCollision: () => false,
        laps: 0
      });
    }
  }
  
  /**
   * Create a placeholder camera when the real Camera class is not available
   */
  createPlaceholderCamera() {
    this.camera = {
      position: { x: 0, y: 0 },
      zoom: 1,
      target: null,
      setTarget: (target) => { this.camera.target = target; },
      update: () => {
        if (this.camera.target && this.camera.target.position) {
          this.camera.position.x = -this.camera.target.position.x + this.game.width / 2;
          this.camera.position.y = -this.camera.target.position.y + this.game.height / 2;
        }
      },
      worldToScreen: (x, y) => ({
        x: x + this.camera.position.x,
        y: y + this.camera.position.y
      }),
      begin: (ctx) => {
        ctx.save();
        ctx.translate(this.camera.position.x, this.camera.position.y);
      },
      end: (ctx) => {
        ctx.restore();
      }
    };
  }
  
  /**
   * Initialize power-ups
   */
  initializePowerUps() {
    this.powerUps = [];
    try {
      // Define simple power-up positions
      const powerUpPositions = [
        { x: 200, y: 200 },
        { x: 300, y: 300 },
        { x: 400, y: 200 },
        { x: 500, y: 300 }
      ];
      
      if (typeof PowerUp === 'function') {
        powerUpPositions.forEach(pos => {
          this.powerUps.push(new PowerUp({
            x: pos.x,
            y: pos.y,
            type: 'random'
          }));
        });
      } else {
        console.warn("PowerUp class not found, using placeholders");
        powerUpPositions.forEach(pos => {
          this.powerUps.push({
            position: { x: pos.x, y: pos.y },
            x: pos.x,
            y: pos.y,
            active: true,
            collider: { radius: 20 },
            update: () => {},
            draw: (ctx, camera) => {
              try {
                ctx.save();
                if (camera && typeof camera.worldToScreen === 'function') {
                  const screenPos = camera.worldToScreen(pos.x, pos.y);
                  ctx.translate(screenPos.x, screenPos.y);
                } else {
                  ctx.translate(pos.x, pos.y);
                }
                ctx.fillStyle = '#00AAFF';
                ctx.beginPath();
                ctx.arc(0, 0, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              } catch (e) {
                console.error("Error drawing placeholder powerup:", e);
                ctx.restore();
              }
            },
            collect: () => ({ type: 'boost', duration: 3000, strength: 1.5 })
          });
        });
      }
    } catch (e) {
      console.error("Error creating power-ups:", e);
      this.powerUps = [];
    }
  }
  
  /**
   * Initialize minimap
   */
  initializeMinimap() {
    try {
      if (typeof Minimap === 'function') {
        this.minimap = new Minimap({
          width: 200,
          height: 150,
          x: this.game.canvas.width - 220,
          y: 20
        });
        this.minimap.setTrack(this.track);
      } else {
        console.warn("Minimap class not found, using placeholder");
        this.minimap = {
          setTrack: () => {},
          draw: () => {},
          update: () => {}
        };
      }
    } catch (e) {
      console.error("Error creating minimap:", e);
      this.minimap = {
        setTrack: () => {},
        draw: () => {},
        update: () => {}
      };
    }
  }
  
  /**
   * Initialize UI
   */
  initializeUI() {
    try {
      if (typeof UI === 'function') {
        this.ui = new UI(this.game);
      } else {
        console.warn("UI class not found, using placeholder");
        this.ui = {
          update: () => {},
          draw: () => {},
          resize: () => {}
        };
      }
    } catch (e) {
      console.error("Error creating UI:", e);
      this.ui = {
        update: () => {},
        draw: () => {},
        resize: () => {}
      };
    }
  }
  
  addEventListeners() {
    // Listen for race-specific key events
    document.addEventListener('keydown', this.keyPressed);
    document.addEventListener('keyup', this.keyReleased);
  }
  
  /**
   * Update the race scene
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime) {
    if (!this.isActive) return;
    
    // Update countdown
    if (!this.isRaceStarted && !this.isRaceFinished) {
      this.countdownTimer -= deltaTime * 1000;
      this.countdown = Math.ceil(this.countdownTimer / 1000);
      
      if (this.countdownTimer <= 0) {
        this.isRaceStarted = true;
        // Start race sound
        // this.game.audio.play('race_start');
        
        // Create particle effect for race start
        this.players.forEach(player => {
          // Safely access x and y from position or directly
          const x = player.position ? player.position.x : (player.x || 0);
          const y = player.position ? player.position.y : (player.y || 0);
          this.addParticleSystem(x, y, 'start');
        });
      }
    }
    
    // Update race time
    if (this.isRaceStarted && !this.isRaceFinished) {
      this.raceTime += deltaTime;
    }
    
    // Update all players
    if (this.players && Array.isArray(this.players)) {
      this.players.forEach(player => {
        try {
          // Only allow player movement after race starts
          const canControl = this.isRaceStarted && !this.isRaceFinished;
          
          // Check if update method exists
          if (typeof player.update === 'function') {
            player.update(deltaTime, this.track, canControl ? this.players : null);
          }
          
          // Skip the rest if not a fully implemented player
          if (!player.position || typeof player.checkCollision !== 'function') {
            return;
          }
          
          // Check if player finished the race
          if (player.laps > (this.game.config && this.game.config.lapsToWin ? 
                             this.game.config.lapsToWin : 3) && 
              !this.results.some(result => result.player === player)) {
            this.playerFinished(player);
          }
          
          // Check power-up collisions
          if (this.powerUps && Array.isArray(this.powerUps)) {
            this.powerUps.forEach(powerUp => {
              try {
                if (powerUp && powerUp.active && this.isRaceStarted) {
                  const collision = player.checkCollision(powerUp);
                  if (collision) {
                    const effect = powerUp.collect(player);
                    if (effect) {
                      const x = powerUp.position ? powerUp.position.x : (powerUp.x || 0);
                      const y = powerUp.position ? powerUp.position.y : (powerUp.y || 0);
                      this.addParticleSystem(x, y, 'powerUp', { color: effect.color || '#FFFFFF' });
                    }
                  }
                }
              } catch (err) {
                console.error("Error checking powerup collision:", err);
              }
            });
          }
          
          // Create particles based on terrain and speed
          try {
            if (player.speed > (player.maxSpeed || player.topSpeed || 5) * 0.5 && Math.random() < 0.1) {
              const x = player.position ? player.position.x : (player.x || 0);
              const y = player.position ? player.position.y : (player.y || 0);
              
              if (this.track && typeof this.track.getTerrainAt === 'function') {
                const terrain = this.track.getTerrainAt(x, y);
                if (terrain && (terrain.id === 'dirt' || terrain.id === 'mud')) {
                  this.addParticleSystem(x, y, 'trail', { 
                    color: terrain.id === 'dirt' ? '#8B4513' : '#5D4037',
                    count: Math.ceil((player.speed || 0) / 5)
                  });
                }
              }
            }
          } catch (err) {
            console.error("Error creating terrain particles:", err);
          }
        } catch (err) {
          console.error("Error updating player:", err);
        }
      });
    }
    
    // Update power-ups
    if (this.powerUps && Array.isArray(this.powerUps)) {
      this.powerUps.forEach(powerUp => {
        try {
          if (typeof powerUp.update === 'function') {
            powerUp.update(deltaTime);
          }
        } catch (err) {
          console.error("Error updating powerup:", err);
        }
      });
    }
    
    // Update particle systems
    if (this.particleSystems && Array.isArray(this.particleSystems)) {
      for (let i = this.particleSystems.length - 1; i >= 0; i--) {
        try {
          const ps = this.particleSystems[i];
          if (ps && typeof ps.update === 'function') {
            ps.update(deltaTime);
            
            // Remove finished particle systems
            if (ps.particles && ps.particles.length === 0) {
              this.particleSystems.splice(i, 1);
            }
          } else {
            // Remove invalid particle systems
            this.particleSystems.splice(i, 1);
          }
        } catch (err) {
          console.error("Error updating particle system:", err);
          // Remove problematic particle system
          this.particleSystems.splice(i, 1);
        }
      }
    }
    
    // Update camera
    if (this.camera && typeof this.camera.update === 'function') {
      this.camera.update(deltaTime);
    }
    
    // Check if race is finished
    if (this.isRaceStarted && this.results.length === (this.players ? this.players.length : 0) && !this.isRaceFinished) {
      this.isRaceFinished = true;
      this.finishDelay = 3000; // 3 seconds until transition
    }
    
    // Transition to results screen after delay
    if (this.isRaceFinished) {
      this.finishDelay -= deltaTime * 1000;
      if (this.finishDelay <= 0) {
        this.transitionToResults();
      }
    }
    
    // Update UI
    if (this.ui && typeof this.ui.update === 'function' && this.players && this.players.length > 0) {
      try {
        const player = this.players[0];
        const playerData = {
          countdown: this.countdown,
          isRaceStarted: this.isRaceStarted,
          isRaceFinished: this.isRaceFinished,
          raceTime: this.raceTime,
          playerPosition: this.getPlayerPosition(),
          currentLap: player.laps || 0,
          maxLaps: this.game.config && this.game.config.lapsToWin ? 
                   this.game.config.lapsToWin : 3,
          playerSpeed: Math.round(player.speed || 0),
          powerUps: player.activePowerups || []
        };
        
        this.ui.update(playerData);
      } catch (err) {
        console.error("Error updating UI:", err);
      }
    }
  }
  
  /**
   * Draw the race scene
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    console.log("RaceScene draw called");
    
    try {
      // Clear the screen
      ctx.fillStyle = '#87CEEB'; // Sky blue background
      ctx.fillRect(0, 0, this.game.width, this.game.height);
      
      // Apply camera transformations
      if (this.camera && typeof this.camera.begin === 'function') {
        this.camera.begin(ctx);
      }
      
      // Draw track
      if (this.track && typeof this.track.draw === 'function') {
        this.track.draw(ctx, this.camera);
      }
      
      // Draw power-ups
      if (this.powerUps && Array.isArray(this.powerUps)) {
        this.powerUps.forEach(powerUp => {
          if (powerUp && typeof powerUp.draw === 'function') {
            try {
              powerUp.draw(ctx, this.camera);
            } catch (err) {
              console.error("Error drawing powerup:", err);
            }
          }
        });
      }
      
      // Draw particle systems
      if (this.particleSystems && Array.isArray(this.particleSystems)) {
        this.particleSystems.forEach(ps => {
          if (ps && typeof ps.draw === 'function') {
            try {
              ps.draw(ctx, this.camera);
            } catch (err) {
              console.error("Error drawing particle system:", err);
            }
          }
        });
      }
      
      // Draw players
      // First sort by y position for pseudo-3D effect - using safe position access
      if (this.players && Array.isArray(this.players)) {
        // Create a safe copy and sort with safety checks
        const sortedPlayers = [...this.players].sort((a, b) => {
          // Safely access y coordinates whether directly or via position object
          const aY = a.position ? a.position.y : (a.y !== undefined ? a.y : 0);
          const bY = b.position ? b.position.y : (b.y !== undefined ? b.y : 0);
          return aY - bY;
        });
        
        sortedPlayers.forEach(player => {
          if (player && typeof player.draw === 'function') {
            try {
              player.draw(ctx, this.camera);
            } catch (err) {
              console.error("Error drawing player:", err);
            }
          }
        });
      }
      
      // End camera transformations
      if (this.camera && typeof this.camera.end === 'function') {
        this.camera.end(ctx);
      }
      
      // Draw UI elements (not affected by camera)
      if (this.minimap && typeof this.minimap.draw === 'function') {
        try {
          this.minimap.draw(ctx, this.players, this.track);
        } catch (err) {
          console.error("Error drawing minimap:", err);
        }
      }
      
      if (this.ui && typeof this.ui.draw === 'function') {
        try {
          this.ui.draw(ctx);
        } catch (err) {
          console.error("Error drawing UI:", err);
        }
      }
      
      // Draw countdown or finish message
      if (!this.isRaceStarted && this.countdown > 0) {
        this.drawCountdown(ctx);
      } else if (this.isRaceFinished) {
        this.drawFinishMessage(ctx);
      }
    } catch (e) {
      console.error("Error drawing race scene:", e);
      
      // Fallback drawing in case of errors
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, this.game.width, this.game.height);
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Race Scene', this.game.width / 2, this.game.height / 2);
      ctx.fillText('Loading...', this.game.width / 2, this.game.height / 2 + 30);
    }
  }
  
  drawCountdown(ctx) {
    try {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, this.game.width, this.game.height);
      
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Glow effect
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 30;
      
      if (this.countdown > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(this.countdown, this.game.width / 2, this.game.height / 2);
      } else {
        ctx.fillStyle = '#00FF00';
        ctx.fillText('GO!', this.game.width / 2, this.game.height / 2);
      }
      ctx.restore();
    } catch (e) {
      console.error("Error drawing countdown:", e);
    }
  }
  
  drawFinishMessage(ctx) {
    try {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.game.width, this.game.height);
      
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFD700';
      
      // Glow effect
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      
      const player = this.players[0];
      const position = this.results.findIndex(r => r.player === player) + 1;
      let message = '';
      
      if (position === 1) {
        message = 'VICTORY!';
      } else if (position === 2) {
        message = '2ND PLACE!';
      } else if (position === 3) {
        message = '3RD PLACE!';
      } else {
        message = `${position}TH PLACE`;
      }
      
      ctx.fillText(message, this.game.width / 2, this.game.height / 2);
      ctx.font = 'bold 30px Arial';
      ctx.fillText('Loading Results...', this.game.width / 2, this.game.height / 2 + 80);
      
      ctx.restore();
    } catch (e) {
      console.error("Error drawing finish message:", e);
    }
  }
  
  playerFinished(player) {
    this.results.push({
      player: player,
      time: this.raceTime,
      position: this.results.length + 1
    });
    
    // Create finish particles
    this.addParticleSystem(player.x, player.y, 'finish');
    
    // Play finish sound
    // if (player.isPlayer) {
    //     this.game.audio.play('finish');
    // }
  }
  
  getPlayerPosition() {
    // Sort players by progress
    const sortedPlayers = [...this.players].sort((a, b) => {
      if (b.laps !== a.laps) {
        return b.laps - a.laps;
      }
      return b.trackProgress - a.trackProgress;
    });
    
    // Find player position
    const playerIndex = sortedPlayers.findIndex(p => p.isPlayer);
    return playerIndex + 1;
  }
  
  addParticleSystem(x, y, type, options = {}) {
    try {
      if (typeof ParticleSystem === 'function') {
        const ps = new ParticleSystem(x, y);
        
        switch (type) {
          case 'start':
            ps.createBurst(50, {
              speed: 200,
              size: { min: 5, max: 15 },
              lifetime: { min: 0.5, max: 1.5 },
              color: '#FFD700'
            });
            break;
          case 'finish':
            ps.createBurst(100, {
              speed: 300,
              size: { min: 5, max: 20 },
              lifetime: { min: 0.5, max: 2 },
              color: ['#FFD700', '#FF4500', '#4169E1', '#32CD32']
            });
            break;
          case 'powerUp':
            ps.createBurst(30, {
              speed: 150,
              size: { min: 3, max: 10 },
              lifetime: { min: 0.3, max: 1 },
              color: options.color || '#FFFFFF'
            });
            break;
          case 'trail':
            ps.createTrail(options.count || 5, {
              speed: 50,
              size: { min: 2, max: 8 },
              lifetime: { min: 0.2, max: 0.8 },
              color: options.color || '#FFFFFF'
            });
            break;
        }
        
        this.particleSystems.push(ps);
      } else {
        console.warn("ParticleSystem class not found, skipping particle effect");
      }
    } catch (e) {
      console.error("Error creating particle system:", e);
    }
  }
  
  transitionToResults() {
    // Save race results to game state
    this.game.raceResults = this.results.map(result => {
      return {
        playerNumber: result.player.playerNumber,
        isPlayer: result.player.isPlayer,
        type: result.player.type,
        position: result.position,
        time: result.time
      };
    });
    
    // Transition to results scene
    this.game.changeScene('results');
  }
  
  exit() {
    super.exit();
    // Clean up event listeners
    document.removeEventListener('keydown', this.keyPressed);
    document.removeEventListener('keyup', this.keyReleased);
  }
  
  keyPressed(event) {
    // Handle race scene specific key presses
    if (event.key === 'Escape') {
      // TODO: Implement pause menu
    }
  }
  
  keyReleased(event) {
    // Handle race scene specific key releases
  }
  
  resize() {
    // Update camera and UI positions on resize
    this.camera.resize(this.game.canvas.width, this.game.canvas.height);
    this.minimap.x = this.game.canvas.width - 220;
    this.ui.resize();
  }
} 