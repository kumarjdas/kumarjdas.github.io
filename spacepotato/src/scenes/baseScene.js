/**
 * BaseScene
 * 
 * Base class for all game scenes. Handles common functionality like
 * initialization, events, transitions, and cleanup.
 */
class BaseScene {
    constructor(game, name = 'base') {
        this.game = game;
        this.isActive = false;
        this.name = name;
        
        // Transition properties
        this.transitionIn = false;
        this.transitionOut = false;
        this.transitionProgress = 0;
        this.transitionDuration = 500; // milliseconds
        
        // Event listeners
        this.eventListeners = [];
        
        // Bind event handlers to maintain this context
        this.keyPressed = this.keyPressed.bind(this);
        this.keyReleased = this.keyReleased.bind(this);
        this.mousePressed = this.mousePressed.bind(this);
        this.mouseReleased = this.mouseReleased.bind(this);
        this.resize = this.resize.bind(this);
    }
    
    /**
     * Initialize the scene
     * Called when the scene becomes active
     */
    init() {
        this.isActive = true;
        this.transitionIn = true;
        this.transitionProgress = 0;
        
        // Add event listeners
        window.addEventListener('resize', this.resize);
    }
    
    /**
     * Exit the scene
     * Called when leaving the scene
     */
    exit() {
        this.isActive = false;
        
        // Remove event listeners
        window.removeEventListener('resize', this.resize);
        
        // Remove any other event listeners
        this.removeAllEventListeners();
    }
    
    /**
     * Add an event listener and track it for cleanup
     * @param {Element} target - DOM element to attach listener to
     * @param {string} type - Event type (e.g., 'click', 'keydown')
     * @param {Function} listener - Event handler function
     * @param {Object} options - Event listener options
     */
    addEventListener(target, type, listener, options) {
        target.addEventListener(type, listener, options);
        this.eventListeners.push({ target, type, listener, options });
    }
    
    /**
     * Remove a specific event listener
     * @param {Element} target - DOM element to remove listener from
     * @param {string} type - Event type
     * @param {Function} listener - Event handler function
     * @param {Object} options - Event listener options
     */
    removeEventListener(target, type, listener, options) {
        target.removeEventListener(type, listener, options);
        this.eventListeners = this.eventListeners.filter(entry => 
            entry.target !== target || 
            entry.type !== type || 
            entry.listener !== listener
        );
    }
    
    /**
     * Remove all tracked event listeners
     */
    removeAllEventListeners() {
        this.eventListeners.forEach(entry => {
            entry.target.removeEventListener(entry.type, entry.listener, entry.options);
        });
        this.eventListeners = [];
    }
    
    /**
     * Update the scene
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Handle transitions
        if (this.transitionIn) {
            this.transitionProgress += deltaTime * 1000;
            if (this.transitionProgress >= this.transitionDuration) {
                this.transitionIn = false;
                this.transitionProgress = 0;
            }
        } else if (this.transitionOut) {
            this.transitionProgress += deltaTime * 1000;
            if (this.transitionProgress >= this.transitionDuration) {
                this.transitionOut = false;
                this.transitionProgress = 0;
                this.game.completeSceneChange();
            }
        }
        
        // Subclasses should call super.update(deltaTime) to run transitions
    }
    
    /**
     * Draw the scene
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        // Base implementation does nothing
        // Override in subclasses
    }
    
    /**
     * Handle scene transitions
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawTransition(ctx) {
        if (!this.transitionIn && !this.transitionOut) return;
        
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const progress = this.transitionProgress / this.transitionDuration;
        
        ctx.fillStyle = 'black';
        
        if (this.transitionIn) {
            // Fade in (black to transparent)
            ctx.globalAlpha = 1 - progress;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
        } else if (this.transitionOut) {
            // Fade out (transparent to black)
            ctx.globalAlpha = progress;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Start transition out animation
     */
    startTransitionOut() {
        this.transitionOut = true;
        this.transitionProgress = 0;
    }
    
    /**
     * Handle window resize event
     */
    resize() {
        // Override in subclasses if needed
    }
    
    /**
     * Handle key pressed event
     * @param {KeyboardEvent} event - Keyboard event
     */
    keyPressed(event) {
        // Override in subclasses
    }
    
    /**
     * Handle key released event
     * @param {KeyboardEvent} event - Keyboard event
     */
    keyReleased(event) {
        // Override in subclasses
    }
    
    /**
     * Handle mouse pressed event
     * @param {MouseEvent} event - Mouse event
     */
    mousePressed(event) {
        // Override in subclasses
    }
    
    /**
     * Handle mouse released event
     * @param {MouseEvent} event - Mouse event
     */
    mouseReleased(event) {
        // Override in subclasses
    }
} 