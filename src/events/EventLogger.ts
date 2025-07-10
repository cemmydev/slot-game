import { IEvent } from './IEvent';
import { EventBus } from './EventBus';

/**
 * Log levels for event logging
 */
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  VERBOSE = 5
}

/**
 * Event log entry interface
 */
export interface EventLogEntry {
  timestamp: number;
  event: IEvent;
  level: LogLevel;
  message?: string;
  context?: any;
}

/**
 * Event logger configuration
 */
export interface EventLoggerConfig {
  maxLogEntries?: number;
  logLevel?: LogLevel;
  enableConsoleOutput?: boolean;
  enableLocalStorage?: boolean;
  filterEventTypes?: string[];
  excludeEventTypes?: string[];
}

/**
 * Advanced event logging system
 */
export class EventLogger {
  private logs: EventLogEntry[] = [];
  private config: Required<EventLoggerConfig>;
  private eventBus: EventBus;
  private isActive = false;

  constructor(eventBus: EventBus, config: EventLoggerConfig = {}) {
    this.eventBus = eventBus;
    this.config = {
      maxLogEntries: config.maxLogEntries || 1000,
      logLevel: config.logLevel || LogLevel.INFO,
      enableConsoleOutput: config.enableConsoleOutput !== false,
      enableLocalStorage: config.enableLocalStorage || false,
      filterEventTypes: config.filterEventTypes || [],
      excludeEventTypes: config.excludeEventTypes || []
    };
  }

  /**
   * Start logging events
   */
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.eventBus.subscribeToAll((event: IEvent) => {
      this.logEvent(event);
    });

    this.log(LogLevel.INFO, 'EventLogger started', { config: this.config });
  }

  /**
   * Stop logging events
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.log(LogLevel.INFO, 'EventLogger stopped');
  }

  /**
   * Log an event
   */
  private logEvent(event: IEvent, level: LogLevel = LogLevel.DEBUG, message?: string): void {
    if (!this.shouldLogEvent(event, level)) return;

    const logEntry: EventLogEntry = {
      timestamp: Date.now(),
      event,
      level,
      message,
      context: this.getEventContext(event)
    };

    this.addLogEntry(logEntry);
    this.outputLog(logEntry);
  }

  /**
   * Log a custom message
   */
  log(level: LogLevel, message: string, context?: any): void {
    if (level > this.config.logLevel) return;

    const logEntry: EventLogEntry = {
      timestamp: Date.now(),
      event: {
        type: 'logger:message',
        timestamp: Date.now(),
        data: { message, context }
      },
      level,
      message,
      context
    };

    this.addLogEntry(logEntry);
    this.outputLog(logEntry);
  }

  /**
   * Check if event should be logged
   */
  private shouldLogEvent(event: IEvent, level: LogLevel): boolean {
    if (level > this.config.logLevel) return false;
    
    // Check filter list (if specified, only log these events)
    if (this.config.filterEventTypes.length > 0) {
      return this.config.filterEventTypes.includes(event.type);
    }

    // Check exclude list
    if (this.config.excludeEventTypes.includes(event.type)) {
      return false;
    }

    return true;
  }

  /**
   * Get additional context for an event
   */
  private getEventContext(event: IEvent): any {
    return {
      source: event.source,
      dataSize: event.data ? JSON.stringify(event.data).length : 0,
      eventAge: Date.now() - event.timestamp
    };
  }

  /**
   * Add log entry to storage
   */
  private addLogEntry(logEntry: EventLogEntry): void {
    this.logs.push(logEntry);

    // Maintain max log entries
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs.shift();
    }

    // Save to localStorage if enabled
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage();
    }
  }

  /**
   * Output log to console
   */
  private outputLog(logEntry: EventLogEntry): void {
    if (!this.config.enableConsoleOutput) return;

    const { event, level, message, context } = logEntry;
    const elapsed = logEntry.timestamp - (this.logs[0]?.timestamp || logEntry.timestamp);
    const prefix = `[${elapsed}ms] [${LogLevel[level]}]`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(`${prefix} ${event.type}`, message || event.data, context);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${event.type}`, message || event.data, context);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${event.type}`, message || event.data, context);
        break;
      case LogLevel.DEBUG:
      case LogLevel.VERBOSE:
        console.log(`${prefix} ${event.type}`, message || event.data, context);
        break;
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const recentLogs = this.logs.slice(-100); // Save only recent 100 logs
      localStorage.setItem('slot-game-event-logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('slot-game-event-logs');
      if (saved) {
        const savedLogs = JSON.parse(saved) as EventLogEntry[];
        this.logs = [...savedLogs, ...this.logs];
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): EventLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): EventLogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs by event type
   */
  getLogsByEventType(eventType: string): EventLogEntry[] {
    return this.logs.filter(log => log.event.type === eventType);
  }

  /**
   * Get logs in time range
   */
  getLogsByTimeRange(startTime: number, endTime: number): EventLogEntry[] {
    return this.logs.filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('slot-game-event-logs');
    }
    this.log(LogLevel.INFO, 'Logs cleared');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get event statistics
   */
  getEventStats(): { [eventType: string]: number } {
    const stats: { [eventType: string]: number } = {};
    this.logs.forEach(log => {
      const eventType = log.event.type;
      stats[eventType] = (stats[eventType] || 0) + 1;
    });
    return stats;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<EventLoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log(LogLevel.INFO, 'Logger configuration updated', newConfig);
  }

  /**
   * Check if logger is active
   */
  isLogging(): boolean {
    return this.isActive;
  }
}
