# Roblox Clone

A web-based 3D building and playing platform inspired by Roblox, built with Three.js, Cannon.js, and Vite.

## Features

✨ **3D World** - Explore a beautiful 3D environment
🏗️ **Building System** - Place and delete blocks to create structures
🎮 **Player Movement** - Smooth first-person movement and jumping
⚙️ **Physics Engine** - Realistic gravity and collisions
💻 **Scripting** - Simple JavaScript-based scripting system
🎨 **Customization** - Change part colors and sizes

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Controls

| Key | Action |
|-----|--------|
| **WASD** | Move |
| **Mouse** | Look around (click to lock pointer) |
| **Space** | Jump |
| **B** | Toggle Build Mode |
| **Left Click** | Place part (in build mode) |
| **Right Click** | Delete part (in build mode) |
| **H** | Reset camera view |

## Building

### Part Properties
- **Color**: Use the color input to select part color (hex format)
- **Size**: Use the slider to adjust part size (1-10 units)
- **Grid Snap**: Parts automatically snap to grid for organized building

### Build Mode
- Press **B** to enter/exit build mode
- In build mode, movement is slower to allow precise building
- Hover over surfaces to see where your part will be placed
- Left-click to place, right-click to delete

## Game Structure

```
src/
├── index.js              # Entry point
├── GameEngine.js         # Main game orchestrator
├── SceneManager.js       # 3D scene management
├── PhysicsEngine.js      # Cannon.js wrapper
├── PlayerController.js   # First-person controls
├── BuildingSystem.js     # Part placement system
└── ScriptingEngine.js    # JavaScript scripting
```

## Development

### Building for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Future Features

- 🌐 Multiplayer support
- 💾 Save/load worlds
- 🎭 Character customization
- 🛠️ Advanced scripting API
- 🎨 More part shapes and textures
- 🔊 Sound effects and music
- 🎯 Game modes and objectives

## Technologies

- **Three.js** - 3D rendering
- **Cannon.js** - Physics simulation
- **Vite** - Build tool and dev server
- **JavaScript ES6+** - Core language

## Performance

The engine is optimized for 60 FPS on modern hardware:
- Shadow mapping for realistic lighting
- Efficient physics stepping
- LOD (Level of Detail) optimizations
- Proper garbage collection

## License

MIT License - Feel free to modify and distribute!

## Tips

1. **Build Efficiently**: Place parts strategically to create interesting structures
2. **Experiment**: Try different colors and sizes to create unique designs
3. **Performance**: Avoid creating too many parts at once for better performance
4. **Precision**: Grid snapping helps create aligned structures
5. **Exploration**: Walk around to appreciate the 3D world you create

---

**Enjoy building!** 🚀
