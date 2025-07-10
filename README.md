# 🎰 Slot Game

A modern slot machine game built with **Phaser 3**, **TypeScript**, and **Event-Driven Architecture**. Features a complete slot machine experience with realistic spinning mechanics, payout calculations, and advanced debugging tools.

## ✨ Features

- **🎮 Classic Slot Machine Gameplay** - Traditional 3-reel slot machine with authentic spinning animations
- **💰 Dynamic Payout System** - Comprehensive paytable with multiple winning combinations and line calculations
- **🔧 Advanced Debug Mode** - Drag-and-drop interface to manually set reel outcomes for testing
- **📱 Responsive Design** - Adaptive scaling that works on desktop and mobile devices
- **⚡ Event-Driven Architecture** - Clean, maintainable code using modern event patterns with ULID-based event tracking
- **🎨 Professional Graphics** - Custom sprite atlas with polished visual assets
- **🔄 Smooth Animations** - Fluid reel spinning with configurable timing and easing

## 🎯 Game Mechanics

### Symbols & Payouts
- **Cherry** - Premium symbol with line-specific payouts (2000/1000/4000)
- **7** - High-value symbol (150 coins for any line)
- **3xBAR, 2xBAR, BAR** - Classic bar symbols with varying values
- **Mixed Combinations** - Special payouts for Cherry+7 and mixed BAR combinations

### Debug Features
- **Manual Reel Control** - Drag symbols to specific positions before spinning
- **Outcome Prediction** - Test specific combinations and payout scenarios
- **Balance Management** - Monitor and adjust player balance in real-time

## 🏗️ Architecture

### Project Structure
```
src/
├── config.ts              # Game configuration and settings
├── index.ts               # Application entry point
├── scenes/                # Phaser game scenes
│   ├── boot.ts            # Initial boot scene
│   ├── preload.ts         # Asset loading scene
│   └── game.ts            # Main game scene
├── objects/               # Game objects and components
│   ├── machine.ts         # Slot machine controller
│   ├── reel.ts            # Individual reel logic
│   ├── slot.ts            # Symbol/slot representation
│   ├── payTable.ts        # Payout calculation engine
│   ├── debugBar.ts        # Debug interface
│   └── button.ts          # Interactive UI elements
└── events/                # Event-driven architecture
    ├── EventBus.ts        # Central event dispatcher
    ├── EventManager.ts    # Event lifecycle management
    ├── GameEvents.ts      # Game-specific event definitions
    ├── EventLogger.ts     # Event tracking and debugging
    └── handlers/          # Event handler implementations
```

### Key Technologies
- **Phaser 3.85.2** - Modern HTML5 game framework
- **TypeScript 5.7** - Type-safe development with latest features
- **Webpack 5** - Advanced bundling with code splitting and optimization
- **Event-Driven Design** - Decoupled architecture using custom event system
- **ULID** - Unique identifiers for event tracking and debugging

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **Yarn** >= 1.22.0 (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slot-game
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   yarn start
   # or
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start development server with hot reload |
| `yarn build` | Create production build |
| `yarn build:analyze` | Build with bundle analyzer |
| `yarn clean` | Remove build artifacts |
| `yarn type-check` | Run TypeScript type checking |
| `yarn lint` | Run ESLint code analysis |
| `yarn lint:fix` | Fix ESLint issues automatically |

### Development Workflow

1. **Hot Reload Development**
   ```bash
   yarn start
   ```
   The development server supports hot module replacement for rapid iteration.

2. **Type Safety**
   ```bash
   yarn type-check
   ```
   Ensure type safety across the entire codebase.

3. **Code Quality**
   ```bash
   yarn lint:fix
   ```
   Maintain consistent code style and catch potential issues.

### Build Configuration

The project uses a sophisticated Webpack setup:

- **Development**: Hot reload, source maps, unminified output
- **Production**: Minification, code splitting, bundle optimization
- **Analysis**: Bundle size analysis and optimization recommendations

## 🎮 How to Play

1. **Start the Game** - Click the spin button to begin
2. **Watch the Reels** - Three reels will spin independently
3. **Check Results** - Winning combinations are calculated across all paylines
4. **Collect Winnings** - Your balance updates automatically
5. **Debug Mode** - Click "Debug" (bottom-left) to manually control outcomes

### Debug Mode Instructions
1. Click "Debug" to open the control panel
2. Switch to "Fixed" mode to enable manual control
3. Drag symbols from the right panel to desired reel positions
4. Click "Spin" to see your predetermined outcome
5. Switch back to "Random" for normal gameplay

## 🔧 Configuration

Game settings can be modified in `src/config.ts`:

```typescript
export const config = {
  payTable: {
    startBalance: 500,        // Starting player balance
    // ... payout configurations
  },
  game: {
    machine: {
      stopDelay: 2000,        // Spin duration (ms)
      reelStopDelay: 500,     // Delay between reel stops (ms)
      // ... other machine settings
    }
  }
  // ... additional configurations
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jurij Galasevic**
- Email: galasevic.jurij@gmail.com
- Built from scratch with modern web technologies and best practices

---

*Built with ❤️ using Phaser 3, TypeScript, and modern web development practices*
