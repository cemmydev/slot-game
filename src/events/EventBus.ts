import { IEvent, IEventHandler, EventListener, IEventSubscription } from './IEvent';

/**
 * Event subscription implementation
 */
class EventSubscription implements IEventSubscription {
  private active = true;

  constructor(
    private readonly eventBus: EventBus,
    private readonly eventType: string,
    private readonly listener: EventListener | IEventHandler
  ) {}

  unsubscribe(): void {
    if (this.active) {
      this.eventBus.unsubscribe(this.eventType, this.listener);
      this.active = false;
    }
  }

  isActive(): boolean {
    return this.active;
  }
}

/**
 * Central event bus for managing all game events
 * Implements the publish-subscribe pattern
 */
export class EventBus {
  private listeners: Map<string, Set<EventListener | IEventHandler>> = new Map();
  private wildcardListeners: Set<EventListener | IEventHandler> = new Set();
  private eventHistory: IEvent[] = [];
  private maxHistorySize = 1000;
  private isLoggingEnabled = false;

  /**
   * Subscribe to a specific event type
   */
  subscribe<T extends IEvent>(
    eventType: string,
    listener: EventListener | IEventHandler<T>
  ): IEventSubscription {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
    
    if (this.isLoggingEnabled) {
      console.log(`[EventBus] Subscribed to event: ${eventType}`);
    }
    
    return new EventSubscription(this, eventType, listener);
  }

  /**
   * Subscribe to all events (wildcard subscription)
   */
  subscribeToAll(listener: EventListener | IEventHandler): IEventSubscription {
    this.wildcardListeners.add(listener);
    
    if (this.isLoggingEnabled) {
      console.log(`[EventBus] Subscribed to all events`);
    }
    
    return new EventSubscription(this, '*', listener);
  }

  /**
   * Unsubscribe from an event type
   */
  unsubscribe(eventType: string, listener: EventListener | IEventHandler): void {
    if (eventType === '*') {
      this.wildcardListeners.delete(listener);
    } else {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    }
    
    if (this.isLoggingEnabled) {
      console.log(`[EventBus] Unsubscribed from event: ${eventType}`);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T extends IEvent>(event: T): void {
    // Add to history
    this.addToHistory(event);
    
    if (this.isLoggingEnabled) {
      console.log(`[EventBus] Emitting event: ${event.type}`, event);
    }

    // Notify specific event type listeners
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        this.callListener(listener, event);
      });
    }

    // Notify wildcard listeners
    this.wildcardListeners.forEach(listener => {
      this.callListener(listener, event);
    });
  }

  /**
   * Call a listener safely with error handling
   */
  private callListener(listener: EventListener | IEventHandler, event: IEvent): void {
    try {
      if (typeof listener === 'function') {
        listener(event);
      } else {
        // Check if handler can handle this event
        if (listener.canHandle && !listener.canHandle(event)) {
          return;
        }
        listener.handle(event);
      }
    } catch (error) {
      console.error(`[EventBus] Error in event listener for ${event.type}:`, error);
    }
  }

  /**
   * Add event to history
   */
  private addToHistory(event: IEvent): void {
    this.eventHistory.push(event);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   */
  getEventHistory(): readonly IEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable/disable event logging
   */
  setLogging(enabled: boolean): void {
    this.isLoggingEnabled = enabled;
  }

  /**
   * Get current subscriber count for an event type
   */
  getSubscriberCount(eventType: string): number {
    const listeners = this.listeners.get(eventType);
    return listeners ? listeners.size : 0;
  }

  /**
   * Get all registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.listeners.clear();
    this.wildcardListeners.clear();
    
    if (this.isLoggingEnabled) {
      console.log(`[EventBus] Cleared all subscriptions`);
    }
  }
}

// Global event bus instance
export const eventBus = new EventBus();
