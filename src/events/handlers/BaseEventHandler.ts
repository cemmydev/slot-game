import { IEvent, IEventHandler, IEventSubscription } from '../IEvent';
import { EventBus } from '../EventBus';

/**
 * Base class for all event handlers
 * Provides common functionality for event handling
 */
export abstract class BaseEventHandler implements IEventHandler {
  protected subscriptions: IEventSubscription[] = [];
  protected isActive = false;

  constructor(protected eventBus: EventBus) {}

  /**
   * Abstract method to handle events - must be implemented by subclasses
   */
  abstract handle(event: IEvent): void;

  /**
   * Optional method to check if this handler can handle the event
   */
  canHandle?(event: IEvent): boolean;

  /**
   * Start listening to events
   */
  start(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.setupSubscriptions();
  }

  /**
   * Stop listening to events
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.cleanupSubscriptions();
  }

  /**
   * Setup event subscriptions - override in subclasses
   */
  protected setupSubscriptions(): void {
    // Default implementation - subscribe to all events
    this.subscriptions.push(
      this.eventBus.subscribeToAll(this)
    );
  }

  /**
   * Cleanup all subscriptions
   */
  protected cleanupSubscriptions(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  /**
   * Subscribe to a specific event type
   */
  protected subscribe<T extends IEvent>(
    eventType: string,
    handler: (event: T) => void
  ): void {
    this.subscriptions.push(
      this.eventBus.subscribe(eventType, handler as (event: IEvent) => void)
    );
  }

  /**
   * Check if handler is active
   */
  isHandlerActive(): boolean {
    return this.isActive;
  }

  /**
   * Cleanup when handler is destroyed
   */
  destroy(): void {
    this.stop();
  }
}
