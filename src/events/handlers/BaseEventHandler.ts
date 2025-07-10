import { IEvent, IEventHandler, IEventSubscription } from '../IEvent';
import { EventBus } from '../EventBus';

export abstract class BaseEventHandler implements IEventHandler {
  protected subscriptions: IEventSubscription[] = [];
  protected isActive = false;

  constructor(protected eventBus: EventBus) {}

  abstract handle(event: IEvent): void;
  canHandle?(event: IEvent): boolean;

  start(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.setupSubscriptions();
  }

  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.cleanupSubscriptions();
  }

  protected setupSubscriptions(): void {
    this.subscriptions.push(this.eventBus.subscribeToAll(this));
  }

  protected cleanupSubscriptions(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  protected subscribe<T extends IEvent>(
    eventType: string,
    handler: (event: T) => void
  ): void {
    this.subscriptions.push(
      this.eventBus.subscribe(eventType, handler as (event: IEvent) => void)
    );
  }

  isHandlerActive(): boolean {
    return this.isActive;
  }

  destroy(): void {
    this.stop();
  }
}
