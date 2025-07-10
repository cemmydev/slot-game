export interface IEvent {
  readonly id: string;
  readonly type: string;
  readonly timestamp: number;
  readonly data?: any;
  readonly source?: string | undefined;
}

import { ulid } from 'ulid';

export abstract class BaseEvent implements IEvent {
  public readonly id: string;
  public readonly timestamp: number;

  constructor(
    public readonly type: string,
    public readonly data?: any,
    public readonly source?: string
  ) {
    this.id = ulid();
    this.timestamp = Date.now();
  }
}

export interface IEventHandler<T extends IEvent = IEvent> {
  handle(event: T): void;
  canHandle?(event: IEvent): boolean;
}

export type EventListener<T extends IEvent = IEvent> = (event: T) => void;

export interface IEventSubscription {
  unsubscribe(): void;
  isActive(): boolean;
}
