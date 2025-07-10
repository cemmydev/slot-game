import { Scene } from 'phaser';
import { EventManager } from './EventManager';
import { EventLogger, LogLevel } from './EventLogger';
import { EVENT_TYPES } from './GameEvents';

/**
 * Debug console for runtime event monitoring and control
 */
export class DebugConsole {
  private scene: Scene;
  private eventManager: EventManager;
  private eventLogger: EventLogger;
  private isVisible = false;
  private container?: Phaser.GameObjects.Container;
  private background?: Phaser.GameObjects.Graphics;
  private logText?: Phaser.GameObjects.Text;
  private commandInput?: Phaser.GameObjects.DOMElement;
  private recentLogs: string[] = [];
  private maxDisplayLogs = 10;

  constructor(scene: Scene, eventManager: EventManager, eventLogger: EventLogger) {
    this.scene = scene;
    this.eventManager = eventManager;
    this.eventLogger = eventLogger;
    this.setupKeyboardControls();
  }

  /**
   * Setup keyboard controls for debug console
   */
  private setupKeyboardControls(): void {
    // Check if keyboard input is available
    if (!this.scene.input.keyboard) {
      console.warn('[DebugConsole] Keyboard input not available');
      return;
    }

    try {
      // Toggle console with F12 or backtick key
      this.scene.input.keyboard.on('keydown-F12', () => {
        this.toggle();
      });

      this.scene.input.keyboard.on('keydown-BACKTICK', () => {
        this.toggle();
      });
    } catch (error) {
      console.warn('[DebugConsole] Failed to setup keyboard controls:', error);
    }
  }

  /**
   * Toggle debug console visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show debug console
   */
  show(): void {
    if (this.isVisible) return;

    this.isVisible = true;
    this.createConsoleUI();
    this.updateLogDisplay();
    
    // Start monitoring events
    this.startEventMonitoring();
  }

  /**
   * Hide debug console
   */
  hide(): void {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.destroyConsoleUI();
  }

  /**
   * Create the console UI
   */
  private createConsoleUI(): void {
    const { width, height } = this.scene.scale;
    
    // Create container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000); // Ensure it's on top

    // Create background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(10, height - 300, width - 20, 280);
    this.background.lineStyle(2, 0x00ff00, 1);
    this.background.strokeRect(10, height - 300, width - 20, 280);
    this.container.add(this.background);

    // Create title
    const title = this.scene.add.text(20, height - 290, 'Event Debug Console (F12 to toggle)', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    this.container.add(title);

    // Create log display area
    this.logText = this.scene.add.text(20, height - 270, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: width - 60 }
    });
    this.container.add(this.logText);

    // Create command input area
    const commandLabel = this.scene.add.text(20, height - 50, 'Command:', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    this.container.add(commandLabel);

    // Add help text
    const helpText = this.scene.add.text(width - 300, height - 290, this.getHelpText(), {
      fontSize: '10px',
      color: '#888888',
      fontFamily: 'monospace'
    });
    this.container.add(helpText);
  }

  /**
   * Destroy console UI
   */
  private destroyConsoleUI(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
    this.background = undefined;
    this.logText = undefined;
    this.commandInput = undefined;
  }

  /**
   * Start monitoring events for display
   */
  private startEventMonitoring(): void {
    // Subscribe to all events for display
    this.eventManager.subscribe('*', (event: any) => {
      this.addLogEntry(`[${event.type}] ${this.formatEventData(event)}`);
    });
  }

  /**
   * Format event data for display
   */
  private formatEventData(event: any): string {
    if (!event.data) return '';
    
    try {
      const data = JSON.stringify(event.data);
      return data.length > 50 ? data.substring(0, 50) + '...' : data;
    } catch {
      return '[Complex Object]';
    }
  }

  /**
   * Add log entry to display
   */
  private addLogEntry(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp} ${message}`;
    
    this.recentLogs.push(logEntry);
    
    // Keep only recent logs
    if (this.recentLogs.length > this.maxDisplayLogs) {
      this.recentLogs.shift();
    }
    
    this.updateLogDisplay();
  }

  /**
   * Update log display
   */
  private updateLogDisplay(): void {
    if (this.logText) {
      this.logText.setText(this.recentLogs.join('\n'));
    }
  }

  /**
   * Get help text for commands
   */
  private getHelpText(): string {
    return [
      'Commands:',
      'stats - Show event statistics',
      'clear - Clear logs',
      'level <0-5> - Set log level',
      'emit <event> - Emit test event',
      'export - Export logs to console'
    ].join('\n');
  }

  /**
   * Execute debug command
   */
  executeCommand(command: string): void {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'stats':
        this.showEventStats();
        break;
      case 'clear':
        this.clearLogs();
        break;
      case 'level':
        this.setLogLevel(args[0]);
        break;
      case 'emit':
        this.emitTestEvent(args[0]);
        break;
      case 'export':
        this.exportLogs();
        break;
      case 'help':
        this.showHelp();
        break;
      default:
        this.addLogEntry(`Unknown command: ${cmd}`);
    }
  }

  /**
   * Show event statistics
   */
  private showEventStats(): void {
    const stats = this.eventLogger.getEventStats();
    console.group('Event Statistics');
    console.table(stats);
    console.groupEnd();
    this.addLogEntry('Event stats logged to console');
  }

  /**
   * Clear logs
   */
  private clearLogs(): void {
    this.recentLogs = [];
    this.eventLogger.clearLogs();
    this.updateLogDisplay();
    this.addLogEntry('Logs cleared');
  }

  /**
   * Set log level
   */
  private setLogLevel(level: string): void {
    const numLevel = parseInt(level);
    if (isNaN(numLevel) || numLevel < 0 || numLevel > 5) {
      this.addLogEntry('Invalid log level. Use 0-5');
      return;
    }
    
    this.eventLogger.updateConfig({ logLevel: numLevel as LogLevel });
    this.addLogEntry(`Log level set to ${LogLevel[numLevel]}`);
  }

  /**
   * Emit test event
   */
  private emitTestEvent(eventType: string): void {
    if (!eventType) {
      this.addLogEntry('Specify event type to emit');
      return;
    }

    // Emit a test event
    this.eventManager.emit({
      type: `test:${eventType}`,
      timestamp: Date.now(),
      data: { test: true, command: 'debug-console' },
      source: 'DebugConsole'
    });
    
    this.addLogEntry(`Emitted test event: ${eventType}`);
  }

  /**
   * Export logs to console
   */
  private exportLogs(): void {
    const logs = this.eventLogger.exportLogs();
    console.log('Exported Event Logs:', logs);
    this.addLogEntry('Logs exported to console');
  }

  /**
   * Show help
   */
  private showHelp(): void {
    console.log(this.getHelpText());
    this.addLogEntry('Help displayed in console');
  }

  /**
   * Check if console is visible
   */
  isConsoleVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy debug console
   */
  destroy(): void {
    this.hide();
  }
}
