import { Scene } from 'phaser';
import { EventBus, eventBus as globalEventBus } from './EventBus';
import { BaseEventHandler } from './handlers/BaseEventHandler';
import { UIEventHandler } from './handlers/UIEventHandler';
import { DebugEventHandler } from './handlers/DebugEventHandler';
import { AnimationEventHandler } from './handlers/AnimationEventHandler';
import { EventLogger, LogLevel } from './EventLogger';
import { DebugConsole } from './DebugConsole';

/**
 * Central manager for all event handlers
 * Coordinates the event system and provides easy access to handlers
 */
export class EventManager {
  private eventBus: EventBus;
  private handlers: Map<string, BaseEventHandler> = new Map();
  private eventLogger?: EventLogger;
  private debugConsole?: DebugConsole;
  private isInitialized = false;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || globalEventBus;
  }

  /**
   * Initialize the event manager with a Phaser scene
   */
  initialize(scene: Scene, options: {
    enableDebugLogging?: boolean;
    debugLogLevel?: 'none' | 'basic' | 'detailed' | 'verbose';
    enableAdvancedLogging?: boolean;
    enableDebugConsole?: boolean;
    logLevel?: LogLevel;
  } = {}): void {
    if (this.isInitialized) {
      console.warn('[EventManager] Already initialized');
      return;
    }

    const {
      enableDebugLogging = true,
      debugLogLevel = 'basic',
      enableAdvancedLogging = true,
      enableDebugConsole = true,
      logLevel = LogLevel.INFO
    } = options;

    // Enable event bus logging if debug is enabled
    if (this.eventBus && typeof this.eventBus.setLogging === 'function') {
      this.eventBus.setLogging(enableDebugLogging);
    } else {
      console.error('[EventManager] EventBus not properly initialized');
      return;
    }

    // Initialize advanced logging
    if (enableAdvancedLogging) {
      this.initializeEventLogger(logLevel);
    }

    // Initialize debug console
    if (enableDebugConsole && this.eventLogger) {
      this.initializeDebugConsole(scene);
    }

    // Create and register handlers
    this.createHandlers(scene, debugLogLevel);

    // Start all handlers
    this.startAllHandlers();

    this.isInitialized = true;
    console.log('[EventManager] Initialized with handlers:', Array.from(this.handlers.keys()));
  }

  /**
   * Initialize event logger
   */
  private initializeEventLogger(logLevel: LogLevel): void {
    this.eventLogger = new EventLogger(this.eventBus, {
      logLevel,
      enableConsoleOutput: true,
      enableLocalStorage: true,
      maxLogEntries: 1000
    });
    this.eventLogger.start();
  }

  /**
   * Initialize debug console
   */
  private initializeDebugConsole(scene: Scene): void {
    if (this.eventLogger) {
      this.debugConsole = new DebugConsole(scene, this, this.eventLogger);
    }
  }

  /**
   * Create all event handlers
   */
  private createHandlers(scene: Scene, debugLogLevel: 'none' | 'basic' | 'detailed' | 'verbose'): void {
    // UI Event Handler
    const uiHandler = new UIEventHandler(this.eventBus, scene);
    this.handlers.set('ui', uiHandler);

    // Animation Event Handler
    const animationHandler = new AnimationEventHandler(this.eventBus, scene);
    this.handlers.set('animation', animationHandler);

    // Debug Event Handler
    const debugHandler = new DebugEventHandler(this.eventBus, debugLogLevel);
    this.handlers.set('debug', debugHandler);

    // Additional handlers can be added here
    // Example: SoundEventHandler, etc.
  }

  /**
   * Start all handlers
   */
  private startAllHandlers(): void {
    this.handlers.forEach((handler, name) => {
      handler.start();
      console.log(`[EventManager] Started handler: ${name}`);
    });
  }

  /**
   * Stop all handlers
   */
  stopAllHandlers(): void {
    this.handlers.forEach((handler, name) => {
      handler.stop();
      console.log(`[EventManager] Stopped handler: ${name}`);
    });
  }

  /**
   * Get a specific handler by name
   */
  getHandler<T extends BaseEventHandler>(name: string): T | undefined {
    return this.handlers.get(name) as T;
  }

  /**
   * Get the UI handler
   */
  getUIHandler(): UIEventHandler | undefined {
    return this.getHandler<UIEventHandler>('ui');
  }

  /**
   * Get the debug handler
   */
  getDebugHandler(): DebugEventHandler | undefined {
    return this.getHandler<DebugEventHandler>('debug');
  }

  /**
   * Get the animation handler
   */
  getAnimationHandler(): AnimationEventHandler | undefined {
    return this.getHandler<AnimationEventHandler>('animation');
  }

  /**
   * Get the event logger
   */
  getEventLogger(): EventLogger | undefined {
    return this.eventLogger;
  }

  /**
   * Get the debug console
   */
  getDebugConsole(): DebugConsole | undefined {
    return this.debugConsole;
  }

  /**
   * Add a custom handler
   */
  addHandler(name: string, handler: BaseEventHandler): void {
    if (this.handlers.has(name)) {
      console.warn(`[EventManager] Handler '${name}' already exists, replacing...`);
      this.handlers.get(name)?.stop();
    }

    this.handlers.set(name, handler);
    
    if (this.isInitialized) {
      handler.start();
    }
    
    console.log(`[EventManager] Added handler: ${name}`);
  }

  /**
   * Remove a handler
   */
  removeHandler(name: string): void {
    const handler = this.handlers.get(name);
    if (handler) {
      handler.stop();
      this.handlers.delete(name);
      console.log(`[EventManager] Removed handler: ${name}`);
    }
  }

  /**
   * Get the event bus instance
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Emit an event through the event bus
   */
  emit(event: any): void {
    this.eventBus.emit(event);
  }

  /**
   * Subscribe to an event
   */
  subscribe(eventType: string, listener: any) {
    return this.eventBus.subscribe(eventType, listener);
  }

  /**
   * Get event statistics from debug handler
   */
  getEventStats(): { [eventType: string]: number } | null {
    const debugHandler = this.getDebugHandler();
    return debugHandler ? debugHandler.getEventStats() : null;
  }

  /**
   * Print event statistics
   */
  printEventStats(): void {
    const debugHandler = this.getDebugHandler();
    if (debugHandler) {
      debugHandler.printEventStats();
    } else {
      console.log('[EventManager] Debug handler not available');
    }
  }

  /**
   * Set debug log level
   */
  setDebugLogLevel(level: 'none' | 'basic' | 'detailed' | 'verbose'): void {
    const debugHandler = this.getDebugHandler();
    if (debugHandler) {
      debugHandler.setLogLevel(level);
    }
  }

  /**
   * Cleanup when shutting down
   */
  destroy(): void {
    this.stopAllHandlers();
    this.handlers.clear();

    // Cleanup logger and debug console
    if (this.eventLogger) {
      this.eventLogger.stop();
    }
    if (this.debugConsole) {
      this.debugConsole.destroy();
    }

    this.eventBus.clear();
    this.isInitialized = false;
    console.log('[EventManager] Destroyed');
  }

  /**
   * Check if manager is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Global event manager instance
export const eventManager = new EventManager(globalEventBus);
