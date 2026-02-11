/**
 * input.js
 * Input handling system for the Potato Racing game
 */

const Input = {
  // State of all keys (pressed or not)
  keys: {},
  
  // State of all mouse buttons
  mouseButtons: {},
  
  // Mouse position
  mouseX: 0,
  mouseY: 0,
  
  // Previous mouse position
  prevMouseX: 0,
  prevMouseY: 0,
  
  // List of pressed gamepad buttons
  gamepadButtons: {},
  
  // Gamepad axes values
  gamepadAxes: {},
  
  // Connected gamepads
  gamepads: [],
  
  // Flag to track if input is initialized
  initialized: false,
  
  /**
   * Initialize input handlers
   */
  init() {
    if (this.initialized) return;
    
    // Set up keyboard event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Set up mouse event listeners
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Set up touch event listeners for mobile
    window.addEventListener('touchstart', this.handleTouchStart.bind(this));
    window.addEventListener('touchmove', this.handleTouchMove.bind(this));
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Set up gamepad event listeners
    window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    
    this.initialized = true;
  },
  
  /**
   * Update input state (call every frame)
   */
  update() {
    // Save previous mouse position
    this.prevMouseX = this.mouseX;
    this.prevMouseY = this.mouseY;
    
    // Update gamepad state
    this.updateGamepads();
  },
  
  /**
   * Handle keydown event
   */
  handleKeyDown(event) {
    this.keys[event.keyCode] = true;
    
    // Prevent default action for arrow keys, space, etc. to avoid page scrolling
    if ([32, 37, 38, 39, 40].includes(event.keyCode)) {
      event.preventDefault();
    }
  },
  
  /**
   * Handle keyup event
   */
  handleKeyUp(event) {
    this.keys[event.keyCode] = false;
  },
  
  /**
   * Handle mouse move event
   */
  handleMouseMove(event) {
    const rect = event.target.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;
  },
  
  /**
   * Handle mouse down event
   */
  handleMouseDown(event) {
    this.mouseButtons[event.button] = true;
  },
  
  /**
   * Handle mouse up event
   */
  handleMouseUp(event) {
    this.mouseButtons[event.button] = false;
  },
  
  /**
   * Handle touch start event
   */
  handleTouchStart(event) {
    event.preventDefault();
    
    const touch = event.touches[0];
    if (touch) {
      const rect = event.target.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
      this.mouseButtons[0] = true;
    }
  },
  
  /**
   * Handle touch move event
   */
  handleTouchMove(event) {
    event.preventDefault();
    
    const touch = event.touches[0];
    if (touch) {
      const rect = event.target.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
    }
  },
  
  /**
   * Handle touch end event
   */
  handleTouchEnd(event) {
    event.preventDefault();
    this.mouseButtons[0] = false;
  },
  
  /**
   * Handle gamepad connected event
   */
  handleGamepadConnected(event) {
    console.log(`Gamepad connected: ${event.gamepad.id}`);
    this.gamepads[event.gamepad.index] = event.gamepad;
  },
  
  /**
   * Handle gamepad disconnected event
   */
  handleGamepadDisconnected(event) {
    console.log(`Gamepad disconnected: ${event.gamepad.id}`);
    delete this.gamepads[event.gamepad.index];
  },
  
  /**
   * Update gamepads state
   */
  updateGamepads() {
    // Get list of gamepads
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    
    // Loop through gamepads and update button/axis state
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      
      if (gamepad) {
        // Store gamepad in our list
        this.gamepads[gamepad.index] = gamepad;
        
        // Update buttons
        for (let j = 0; j < gamepad.buttons.length; j++) {
          const buttonKey = `${gamepad.index}_${j}`;
          this.gamepadButtons[buttonKey] = gamepad.buttons[j].pressed;
        }
        
        // Update axes
        for (let j = 0; j < gamepad.axes.length; j++) {
          const axisKey = `${gamepad.index}_${j}`;
          this.gamepadAxes[axisKey] = gamepad.axes[j];
        }
      }
    }
  },
  
  /**
   * Check if a key is pressed
   * @param {number} keyCode - Key code to check
   * @returns {boolean} True if key is pressed
   */
  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  },
  
  /**
   * Check if a mouse button is pressed
   * @param {number} button - Button to check (0=left, 1=middle, 2=right)
   * @returns {boolean} True if button is pressed
   */
  isMouseButtonPressed(button) {
    return !!this.mouseButtons[button];
  },
  
  /**
   * Check if a gamepad button is pressed
   * @param {number} gamepadIndex - Gamepad index
   * @param {number} button - Button index
   * @returns {boolean} True if button is pressed
   */
  isGamepadButtonPressed(gamepadIndex, button) {
    const buttonKey = `${gamepadIndex}_${button}`;
    return !!this.gamepadButtons[buttonKey];
  },
  
  /**
   * Get gamepad axis value
   * @param {number} gamepadIndex - Gamepad index
   * @param {number} axis - Axis index
   * @returns {number} Axis value (-1 to 1)
   */
  getGamepadAxis(gamepadIndex, axis) {
    const axisKey = `${gamepadIndex}_${axis}`;
    return this.gamepadAxes[axisKey] || 0;
  },
  
  /**
   * Get mouse movement delta since last frame
   * @returns {Object} Delta {x, y}
   */
  getMouseDelta() {
    return {
      x: this.mouseX - this.prevMouseX,
      y: this.mouseY - this.prevMouseY
    };
  },
  
  /**
   * Check if any key in a set is pressed
   * @param {Array} keyCodes - Array of key codes
   * @returns {boolean} True if any key is pressed
   */
  isAnyKeyPressed(keyCodes) {
    return keyCodes.some(code => this.isKeyPressed(code));
  },
  
  /**
   * Get total number of connected gamepads
   * @returns {number} Number of gamepads
   */
  getGamepadCount() {
    return this.gamepads.filter(pad => pad !== null && pad !== undefined).length;
  },
  
  /**
   * Get player controls state (movement direction, action, etc.)
   * @param {number} playerIndex - Player index (0-3)
   * @returns {Object} Controls state
   */
  getPlayerControls(playerIndex) {
    // Get control scheme for player
    const controls = Object.values(CONFIG.CONTROLS)[playerIndex] || CONFIG.CONTROLS.PLAYER1;
    
    // Get gamepad for player if available
    const gamepad = this.gamepads[playerIndex];
    
    // Default control state
    const controlState = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false,
      direction: { x: 0, y: 0 }
    };
    
    // Check keyboard input
    controlState.up = this.isKeyPressed(controls.UP);
    controlState.down = this.isKeyPressed(controls.DOWN);
    controlState.left = this.isKeyPressed(controls.LEFT);
    controlState.right = this.isKeyPressed(controls.RIGHT);
    controlState.action = this.isKeyPressed(controls.ACTION);
    
    // Apply gamepad input if available
    if (gamepad) {
      // Check DPad
      if (gamepad.buttons[12] && gamepad.buttons[12].pressed) controlState.up = true;
      if (gamepad.buttons[13] && gamepad.buttons[13].pressed) controlState.down = true;
      if (gamepad.buttons[14] && gamepad.buttons[14].pressed) controlState.left = true;
      if (gamepad.buttons[15] && gamepad.buttons[15].pressed) controlState.right = true;
      
      // Check action buttons (A or X on standard gamepads)
      if ((gamepad.buttons[0] && gamepad.buttons[0].pressed) || 
          (gamepad.buttons[2] && gamepad.buttons[2].pressed)) {
        controlState.action = true;
      }
      
      // Check left analog stick
      if (Math.abs(gamepad.axes[0]) > 0.2) {
        if (gamepad.axes[0] < -0.5) controlState.left = true;
        if (gamepad.axes[0] > 0.5) controlState.right = true;
      }
      
      if (Math.abs(gamepad.axes[1]) > 0.2) {
        if (gamepad.axes[1] < -0.5) controlState.up = true;
        if (gamepad.axes[1] > 0.5) controlState.down = true;
      }
    }
    
    // Calculate direction vector
    controlState.direction.x = (controlState.right ? 1 : 0) - (controlState.left ? 1 : 0);
    controlState.direction.y = (controlState.down ? 1 : 0) - (controlState.up ? 1 : 0);
    
    // Normalize direction vector if moving diagonally
    if (controlState.direction.x !== 0 && controlState.direction.y !== 0) {
      const magnitude = Math.sqrt(controlState.direction.x * controlState.direction.x + 
                                  controlState.direction.y * controlState.direction.y);
      controlState.direction.x /= magnitude;
      controlState.direction.y /= magnitude;
    }
    
    return controlState;
  }
}; 