/**
 * Base interface for all game events
 */
export interface IEvent {
  /** Unique identifier for the event type */
  readonly type: string;
  /** Timestamp when the event was created */
  readonly timestamp: number;
  /** Optional event data payload */
  readonly data?: any;
  /** Optional event source identifier */
  readonly source?: string;
}

/**
 * Base abstract class for all game events
 */
export abstract class BaseEvent implements IEvent {
  public readonly timestamp: number;
  
  constructor(
    public readonly type: string,
    public readonly data?: any,
    public readonly source?: string
  ) {
    this.timestamp = Date.now();
  }
}

/**
 * Interface for event handlers
 */
export interface IEventHandler<T extends IEvent = IEvent> {
  /** Handle the event */
  handle(event: T): void;
  /** Optional: Check if this handler can handle the event */
  canHandle?(event: IEvent): boolean;
}

/**
 * Interface for event listeners (simple callback functions)
 */
export type EventListener<T extends IEvent = IEvent> = (event: T) => void;

/**
 * Event subscription interface
 */
export interface IEventSubscription {
  /** Unsubscribe from the event */
  unsubscribe(): void;
  /** Check if subscription is active */
  isActive(): boolean;
}
