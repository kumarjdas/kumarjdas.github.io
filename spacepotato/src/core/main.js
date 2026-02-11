/**
 * main.js
 * 
 * Entry point for the Potato Racing game. Initializes the game and starts it.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    try {
        // Initialize Helpers if available
        if (window.Helpers === undefined) {
            console.warn('Helpers not found, creating basic implementation');
            window.Helpers = {
                clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
                lerp: (a, b, t) => a + (b - a) * t,
                random: (min, max) => Math.random() * (max - min) + min,
                randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
                randomColor: () => '#' + Math.floor(Math.random() * 16777215).toString(16),
                distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
                rectContains: (px, py, rx, ry, rw, rh) => 
                    px >= rx - rw / 2 && px <= rx + rw / 2 && 
                    py >= ry - rh / 2 && py <= ry + rh / 2
            };
        }
        
        // Initialize Input system if available
        if (window.Input) {
            window.Input.init();
            console.log('Input system initialized');
        } else {
            console.warn('Input system not found');
        }
        
        // Ensure CONFIG exists
        if (window.CONFIG === undefined) {
            console.warn('CONFIG not found, using default configuration');
            window.CONFIG = {
                GAME: {
                    WIDTH: 800,
                    HEIGHT: 600
                }
            };
        }
        
        // Create game instance
        const game = new Game('gameCanvas');
        
        // Initialize the game
        game.init();
        
        // Make game accessible globally for debugging
        window.game = game;
        
        console.log('Game started successfully!');
    } catch (e) {
        console.error('Error initializing game:', e);
        
        // Display error message on canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Error initializing game', canvas.width / 2, canvas.height / 2 - 20);
                ctx.font = '16px Arial';
                ctx.fillText('Check console for details', canvas.width / 2, canvas.height / 2 + 20);
            }
        }
    }
}); 