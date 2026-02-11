/**
 * Game
 * 
 * Main game class that handles initialization, game loop, scene management,
 * and rendering.
 */
class Game {
    constructor(canvasId) {
        // Canvas and rendering context
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game dimensions (convenience properties)
        this.width = 800;
        this.height = 600;
        
        // Game state
        this.running = false;
        this.lastTimestamp = 0;
        this.currentScene = null;
        this.nextScene = null;
        this.scenes = {};
        this.keys = {};
        this.config = {
            // Display settings
            width: 800,
            height: 600,
            fullscreen: false,
            
            // Game settings
            lapsToWin: 3,
            countdownTime: 3000, // milliseconds
            
            // Player settings
            selectedPotato: 'russet',
            currentTrack: 'oval',
            opponentCount: 2,
            difficulty: 'medium',
            
            // Audio settings
            sound: true,
            music: true,
            
            // Debug settings
            showDebug: false
        };
        
        // Game assets
        this.assets = {
            images: {
                potatoes: {},
                tracks: {},
                ui: {}
            },
            sounds: {
                music: null,
                sfx: {}
            }
        };
        
        // Game state
        this.state = {
            settings: {
                musicVolume: 0.5,
                sfxVolume: 0.7,
                controls: {}
            },
            unlockedPotatoes: ['Russet', 'Red'],
            selectedPotato: 'Russet'
        };
        
        // Race results from the last race
        this.raceResults = null;
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }
    
    /**
     * Initialize the game
     */
    init() {
        console.log('Initializing game...');
        
        // Set up canvas
        this.resizeCanvas();
        
        // Register scenes
        this.registerScenes();
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('resize', this.handleResize);
        
        // Start with menu scene
        this.changeScene('menu');
        
        // Start the game loop
        this.start();
        
        console.log('Game initialized');
    }
    
    /**
     * Register all game scenes
     */
    registerScenes() {
        this.scenes = {
            menu: new MenuScene(this, 'menu'),
            race: new RaceScene(this, 'race'),
            results: new ResultsScene(this, 'results')
        };
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (!this.running) {
            this.running = true;
            this.lastTimestamp = performance.now();
            requestAnimationFrame(this.gameLoop);
            console.log('Game started');
        }
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
        console.log('Game stopped');
    }
    
    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    gameLoop(timestamp) {
        if (!this.running) return;
        
        // Calculate delta time (in seconds)
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        
        // Limit delta time to prevent large jumps
        const cappedDeltaTime = Math.min(deltaTime, 0.1);
        
        // Update current scene
        if (this.currentScene) {
            this.currentScene.update(cappedDeltaTime);
        }
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw current scene - add debug
        console.log("Drawing scene:", this.currentScene ? this.currentScene.name : "none");
        if (this.currentScene) {
            this.currentScene.draw(this.ctx);
            this.currentScene.drawTransition(this.ctx);
        }
        
        // Draw FPS if debug is enabled
        if (this.config.showDebug) {
            this.drawDebugInfo(cappedDeltaTime);
        }
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Change to a different scene
     * @param {string} sceneName - Name of the scene to change to
     */
    changeScene(sceneName) {
        const newScene = this.scenes[sceneName];
        
        if (!newScene) {
            console.error(`Scene '${sceneName}' not found`);
            return;
        }
        
        this.nextScene = newScene;
        
        // If there's a current scene, start its exit transition
        if (this.currentScene) {
            this.currentScene.startTransitionOut();
        } else {
            // If there's no current scene, just switch immediately
            this.completeSceneChange();
        }
    }
    
    /**
     * Complete the scene change after transition
     */
    completeSceneChange() {
        // Exit current scene if it exists
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        // Set new scene as current and initialize it
        this.currentScene = this.nextScene;
        this.nextScene = null;
        
        if (this.currentScene) {
            this.currentScene.init();
        }
    }
    
    /**
     * Handle window resize
     */
    resizeCanvas() {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        
        if (this.config.fullscreen) {
            // Set canvas to full window size
            this.canvas.width = containerWidth;
            this.canvas.height = containerHeight;
            this.width = containerWidth;
            this.height = containerHeight;
        } else {
            // Set canvas to fixed size with proper aspect ratio
            const targetRatio = this.config.width / this.config.height;
            const currentRatio = containerWidth / containerHeight;
            
            let width, height;
            
            if (currentRatio > targetRatio) {
                // Container is wider than target ratio
                height = Math.min(containerHeight, this.config.height);
                width = height * targetRatio;
            } else {
                // Container is taller than target ratio
                width = Math.min(containerWidth, this.config.width);
                height = width / targetRatio;
            }
            
            this.canvas.width = width;
            this.canvas.height = height;
            this.width = width;
            this.height = height;
        }
        
        // Notify current scene of resize
        if (this.currentScene) {
            this.currentScene.resize();
        }
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        this.config.fullscreen = !this.config.fullscreen;
        this.resizeCanvas();
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event - Key event
     */
    handleKeyDown(event) {
        this.keys[event.key] = true;
        
        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
        
        // Forward event to current scene
        if (this.currentScene) {
            this.currentScene.keyPressed(event);
        }
    }
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Key event
     */
    handleKeyUp(event) {
        this.keys[event.key] = false;
        
        // Forward event to current scene
        if (this.currentScene) {
            this.currentScene.keyReleased(event);
        }
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} key - Key to check
     * @returns {boolean} True if the key is pressed
     */
    isKeyPressed(key) {
        return this.keys[key] === true;
    }
    
    /**
     * Handle window resize event
     */
    handleResize() {
        this.resizeCanvas();
    }
    
    /**
     * Draw debug information
     * @param {number} deltaTime - Time since last frame in seconds
     */
    drawDebugInfo(deltaTime) {
        const fps = Math.round(1 / deltaTime);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`FPS: ${fps}`, 10, 10);
        this.ctx.fillText(`Scene: ${this.currentScene ? this.currentScene.name : 'none'}`, 10, 30);
        this.ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, 50);
    }
} 