/**
 * config.js
 * Configuration settings for the potato racing game
 */

// Create default CONFIG if it doesn't exist
if (!window.CONFIG) {
  window.CONFIG = {};
}

// Ensure essential CONFIG sections exist
if (!CONFIG.TERRAIN) {
  CONFIG.TERRAIN = {
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
      color: '#ADD8E6'
    },
    OIL: {
      id: 'oil',
      friction: 0.7,
      grip: 0.2,
      color: '#000000'
    }
  };
}

if (!CONFIG.PHYSICS) {
  CONFIG.PHYSICS = {
    BASE_FRICTION: 0.05,
    ROTATION_SPEED: 0.1,
    BOUNCE_FACTOR: 0.5,
    COLLISION_DAMAGE: 10
  };
}

if (!CONFIG.POWERUPS) {
  CONFIG.POWERUPS = {
    SPEED_BOOST: {
      id: 'boost',
      color: '#00AAFF',
      duration: 3000,
      strength: 1.5,
      respawnTime: 10000
    },
    SHIELD: {
      id: 'shield',
      color: '#00FF00',
      duration: 5000,
      strength: 1.0,
      respawnTime: 15000
    },
    GHOST: {
      id: 'ghost',
      color: '#AAAAAA',
      duration: 3000,
      strength: 1.0,
      respawnTime: 20000
    },
    OIL_SLICK: {
      id: 'oil',
      color: '#663300',
      duration: 5000,
      strength: 1.0,
      respawnTime: 15000
    },
    SIZE_REDUCTION: {
      id: 'shrink',
      color: '#FF00FF',
      duration: 4000,
      strength: 0.75,
      respawnTime: 20000
    }
  };
}

if (!CONFIG.POTATO_TYPES) {
  CONFIG.POTATO_TYPES = {
    RUSSET: {
      name: 'Russet',
      color: '#A0522D',
      topSpeed: 5,
      acceleration: 0.2,
      handling: 1.0,
      weight: 1.0
    },
    RED: {
      name: 'Red',
      color: '#8B0000',
      topSpeed: 4.5,
      acceleration: 0.25,
      handling: 1.2,
      weight: 0.9
    },
    SWEET: {
      name: 'Sweet',
      color: '#FF8C00',
      topSpeed: 4.8,
      acceleration: 0.22,
      handling: 1.1,
      weight: 0.95
    },
    PURPLE: {
      name: 'Purple',
      color: '#800080',
      topSpeed: 5.2,
      acceleration: 0.18,
      handling: 0.9,
      weight: 1.1
    }
  };
}

if (!CONFIG.BALANCE) {
  CONFIG.BALANCE = {
    CATCHUP_FACTOR: 0.05,
    LAP_HEALTH_BONUS: 20,
    HEALTH_REGEN: 0.5
  };
}

if (!CONFIG.DEBUG) {
  CONFIG.DEBUG = {
    SHOW_COLLIDERS: false,
    SHOW_CHECKPOINTS: false,
    SHOW_CAMERA_INFO: false,
    SHOW_UNKNOWN_OBSTACLES: false,
    SHOW_UNKNOWN_DECORATIONS: false
  };
}

if (!CONFIG.MODES) {
  CONFIG.MODES = {
    GRAND_PRIX: {
      laps: 3,
      tracks: ['oval', 'figure8', 'circuit'],
      points: [10, 7, 5, 3, 1, 0]
    },
    QUICK_RACE: {
      laps: 3
    },
    TIME_TRIAL: {
      laps: 1
    }
  };
}

const CONFIG = {
  // Game settings
  GAME: {
    TITLE: "Potato Racing",
    VERSION: "1.0.0",
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: [240, 240, 240],
    LAPS_TO_WIN: 3,
    RESTART_DELAY: 3000, // ms
    DEBUG: false
  },
  
  // Physics settings
  PHYSICS: {
    FRICTION: {
      ASPHALT: 0.97,
      GRASS: 0.94,
      DIRT: 0.92,
      OIL: 0.85
    },
    MAX_SPEED: 7,
    ACCELERATION: 0.2,
    TURN_SPEED: 0.05,
    COLLISION_DAMPING: 0.7
  },
  
  // Player settings
  PLAYER_TYPES: {
    RUSSET: {
      COLOR: [165, 100, 50],
      TOP_SPEED: 1.0,    // Multiplier
      ACCELERATION: 1.0, // Multiplier
      HANDLING: 1.0,     // Multiplier
      HEALTH: 100
    },
    RED: {
      COLOR: [200, 50, 50],
      TOP_SPEED: 1.1,
      ACCELERATION: 0.9,
      HANDLING: 1.0,
      HEALTH: 90
    },
    GOLD: {
      COLOR: [230, 200, 50],
      TOP_SPEED: 0.9,
      ACCELERATION: 1.1,
      HANDLING: 1.1,
      HEALTH: 85
    },
    SWEET: {
      COLOR: [230, 130, 50],
      TOP_SPEED: 1.2,
      ACCELERATION: 1.2,
      HANDLING: 0.8,
      HEALTH: 80
    }
  },
  
  // Terrain types
  TERRAIN: {
    ASPHALT: {
      COLOR: [80, 80, 80],
      FRICTION: 0.97,
      SPEED_FACTOR: 1.0
    },
    GRASS: {
      COLOR: [100, 200, 70],
      FRICTION: 0.94,
      SPEED_FACTOR: 0.7
    },
    DIRT: {
      COLOR: [150, 120, 60],
      FRICTION: 0.92,
      SPEED_FACTOR: 0.8
    },
    OIL: {
      COLOR: [30, 30, 30],
      FRICTION: 0.85,
      SPEED_FACTOR: 0.6,
      DURATION: 8000 // ms
    }
  },
  
  // Power-up settings
  POWERUPS: {
    RESPAWN_TIME: 10000, // ms
    TYPES: {
      BOOST: {
        COLOR: [50, 200, 250],
        DURATION: 3000, // ms
        SPEED_MULTIPLIER: 1.5
      },
      SHIELD: {
        COLOR: [100, 100, 250],
        DURATION: 5000, // ms
      },
      MISSILE: {
        COLOR: [250, 50, 50],
        SPEED: 10,
        DAMAGE: 30
      },
      OIL: {
        COLOR: [30, 30, 30],
        DURATION: 8000, // ms
        SIZE: 60
      },
      REPAIR: {
        COLOR: [50, 250, 50],
        HEALTH_RESTORE: 40
      }
    }
  },
  
  // Audio settings
  AUDIO: {
    MASTER_VOLUME: 0.7,
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.8,
    MUTE: false
  },
  
  // AI settings
  AI: {
    DIFFICULTY: {
      EASY: {
        SPEED_FACTOR: 0.8,
        MISTAKE_PROBABILITY: 0.1
      },
      MEDIUM: {
        SPEED_FACTOR: 0.9,
        MISTAKE_PROBABILITY: 0.05
      },
      HARD: {
        SPEED_FACTOR: 1.0,
        MISTAKE_PROBABILITY: 0.02
      }
    },
    PATH_FOLLOW_FORCE: 0.08,
    LOOK_AHEAD_DISTANCE: 100
  },
  
  // Camera settings
  CAMERA: {
    FOLLOW_SPEED: 0.1,
    ZOOM_LEVEL: 1.0,
    LOOK_AHEAD_FACTOR: 0.3,
    SHAKE_DECAY: 0.9
  },
  
  // Debug options
  DEBUG: {
    ENABLED: false,
    SHOW_FPS: true,
    SHOW_COLLIDERS: false,
    SHOW_WAYPOINTS: false,
    SHOW_TERRAIN_GRID: false,
    LOG_LEVEL: "INFO" // "NONE", "ERROR", "WARN", "INFO", "DEBUG"
  },
  
  // Controls
  CONTROLS: {
    KEYBOARD: {
      PLAYER1: {
        UP: 87,      // W
        DOWN: 83,    // S
        LEFT: 65,    // A
        RIGHT: 68,   // D
        USE_ITEM: 32 // Space
      },
      PLAYER2: {
        UP: 38,      // Arrow Up
        DOWN: 40,    // Arrow Down
        LEFT: 37,    // Arrow Left
        RIGHT: 39,   // Arrow Right
        USE_ITEM: 13 // Enter
      }
    },
    GAMEPAD: {
      DEADZONE: 0.1,
      ACCELERATION_BUTTON: 0,
      BRAKE_BUTTON: 1,
      USE_ITEM_BUTTON: 2
    }
  }
};

// Export the config for global use
window.CONFIG = CONFIG; 