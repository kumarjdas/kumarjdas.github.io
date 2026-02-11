# Potato Racing Game

A fun racing game where potatoes compete on various tracks with power-ups and special abilities!

## Description

Potato Racing is a top-down 2D racing game built with JavaScript and p5.js. Players control customizable potato characters and race against AI opponents on various track types.

### Features

- Race as different types of potatoes (Russet, Red, Gold, Sweet)
- Collect and use power-ups during races
- Navigate different terrain types that affect handling
- Track lap times and race positions
- Customize your potato racer

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Running the Game

1. Clone this repository:
```
git clone https://github.com/yourusername/potatoracing.git
cd potatoracing
```

2. Serve the files with a local web server:
   - Using Python's built-in server:
     ```
     python -m http.server
     ```
   - Using Node.js with http-server:
     ```
     npx http-server
     ```
   - Or simply open the `index.html` file directly in a browser

3. Open your browser and navigate to `http://localhost:8000` (or the appropriate port)

### Controls

- Arrow keys or WASD to control your potato
- Space to use collected power-ups
- P or Escape to pause the game
- Enter or Space to confirm menu selections

## Game Components

- **Potatoes**: Player characters with different stats
- **Track**: Various terrain types and obstacles
- **Power-ups**: Special items to gain advantage (boost, shield, missile, oil, repair)
- **Camera**: Dynamic view that follows players
- **Minimap**: Overview of track and player positions
- **UI**: Race information display

## Development

### Project Structure

```
potatoracing/
├── assets/
│   ├── images/
│   │   ├── potatoes/
│   │   ├── powerups/
│   │   ├── track/
│   │   └── ui/
│   └── fonts/
├── src/
│   ├── components/
│   │   ├── camera.js
│   │   ├── minimap.js
│   │   ├── particle.js
│   │   ├── potato.js
│   │   ├── powerup.js
│   │   ├── track.js
│   │   └── ui.js
│   ├── core/
│   │   ├── config.js
│   │   ├── game.js
│   │   └── main.js
│   ├── scenes/
│   │   ├── baseScene.js
│   │   ├── menuScene.js
│   │   ├── raceScene.js
│   │   └── resultsScene.js
│   └── utils/
│       └── helpers.js
└── index.html
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- p5.js for the rendering and input handling
- Inspiration from classic racing games 