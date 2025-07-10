import { BaseEventHandler } from './BaseEventHandler';
import { IEvent } from '../IEvent';
import { EventBus } from '../EventBus';

/**
 * Handles event logging and debugging functionality
 */
export class DebugEventHandler extends BaseEventHandler {
  private logLevel: 'none' | 'basic' | 'detailed' | 'verbose' = 'basic';
  private eventCounts: Map<string, number> = new Map();
  private startTime: number = Date.now();

  constructor(eventBus: EventBus, logLevel: 'none' | 'basic' | 'detailed' | 'verbose' = 'basic') {
    super(eventBus);
    this.logLevel = logLevel;
  }

  /**
   * Handle all events for debugging purposes
   */
  handle(event: IEvent): void {
    if (this.logLevel === 'none') {
      return;
    }

    // Update event counts
    const currentCount = this.eventCounts.get(event.type) || 0;
    this.eventCounts.set(event.type, currentCount + 1);

    // Log based on level
    switch (this.logLevel) {
      case 'basic':
        this.logBasic(event);
        break;
      case 'detailed':
        this.logDetailed(event);
        break;
      case 'verbose':
        this.logVerbose(event);
        break;
    }
  }

  /**
   * Basic logging - just event type and timestamp
   */
  private logBasic(event: IEvent): void {
    const elapsed = event.timestamp - this.startTime;
    console.log(`[${elapsed}ms] ${event.type}`);
  }

  /**
   * Detailed logging - includes event data
   */
  private logDetailed(event: IEvent): void {
    const elapsed = event.timestamp - this.startTime;
    console.log(`[${elapsed}ms] ${event.type}`, {
      source: event.source,
      data: event.data
    });
  }

  /**
   * Verbose logging - includes full event object and stack trace
   */
  private logVerbose(event: IEvent): void {
    const elapsed = event.timestamp - this.startTime;
    console.group(`[${elapsed}ms] ${event.type}`);
    console.log('Event:', event);
    console.log('Stack trace:', new Error().stack);
    console.groupEnd();
  }

  /**
   * Set logging level
   */
  setLogLevel(level: 'none' | 'basic' | 'detailed' | 'verbose'): void {
    this.logLevel = level;
    console.log(`[DebugEventHandler] Log level set to: ${level}`);
  }

  /**
   * Get event statistics
   */
  getEventStats(): { [eventType: string]: number } {
    const stats: { [eventType: string]: number } = {};
    this.eventCounts.forEach((count, eventType) => {
      stats[eventType] = count;
    });
    return stats;
  }

  /**
   * Print event statistics to console
   */
  printEventStats(): void {
    console.group('[DebugEventHandler] Event Statistics');
    console.table(this.getEventStats());
    console.groupEnd();
  }

  /**
   * Clear event statistics
   */
  clearStats(): void {
    this.eventCounts.clear();
    this.startTime = Date.now();
    console.log('[DebugEventHandler] Statistics cleared');
  }

  /**
   * Get most frequent events
   */
  getMostFrequentEvents(limit: number = 5): Array<{ eventType: string; count: number }> {
    return Array.from(this.eventCounts.entries())
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Check if this handler can handle any event (it handles all for debugging)
   */
  override canHandle(_event: IEvent): boolean {
    return true; // Debug handler processes all events
  }

  /**
   * Setup subscriptions - subscribe to all events
   */
  protected override setupSubscriptions(): void {
    // Subscribe to all events for debugging
    this.subscriptions.push(
      this.eventBus.subscribeToAll(this)
    );
  }
}
