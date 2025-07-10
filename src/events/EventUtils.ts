import { ulid } from 'ulid';
import { IEvent } from './IEvent';

/**
 * Utility functions for event creation and management
 */
export class EventUtils {
  /**
   * Create a simple event with ULID
   */
  static createEvent(type: string, data?: any, source?: string): IEvent {
    return {
      id: ulid(),
      type,
      timestamp: Date.now(),
      data,
      source
    };
  }

  /**
   * Create an event with custom timestamp
   */
  static createEventWithTimestamp(type: string, timestamp: number, data?: any, source?: string): IEvent {
    return {
      id: ulid(),
      type,
      timestamp,
      data,
      source
    };
  }

  /**
   * Create an event with custom ID (useful for testing)
   */
  static createEventWithId(id: string, type: string, data?: any, source?: string): IEvent {
    return {
      id,
      type,
      timestamp: Date.now(),
      data,
      source
    };
  }

  /**
   * Generate a new ULID
   */
  static generateId(): string {
    return ulid();
  }

  /**
   * Extract timestamp from ULID
   */
  static getTimestampFromUlid(id: string): number {
    try {
      // ULID first 10 characters represent timestamp in base32
      const timestampPart = id.substring(0, 10);
      // Convert from base32 to timestamp
      const timestamp = parseInt(timestampPart, 32);
      return timestamp;
    } catch (error) {
      console.warn('Failed to extract timestamp from ULID:', error);
      return Date.now();
    }
  }

  /**
   * Check if a string is a valid ULID format
   */
  static isValidUlid(id: string): boolean {
    // ULID is 26 characters long and uses Crockford's Base32
    const ulidRegex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;
    return ulidRegex.test(id);
  }

  /**
   * Compare two ULIDs chronologically
   */
  static compareUlids(a: string, b: string): number {
    // ULIDs are lexicographically sortable
    return a.localeCompare(b);
  }

  /**
   * Get events sorted by their ULID (chronological order)
   */
  static sortEventsByUlid(events: IEvent[]): IEvent[] {
    return events.sort((a, b) => EventUtils.compareUlids(a.id, b.id));
  }

  /**
   * Filter events by time range using ULID timestamps
   */
  static filterEventsByTimeRange(events: IEvent[], startTime: number, endTime: number): IEvent[] {
    return events.filter(event => {
      const eventTime = EventUtils.getTimestampFromUlid(event.id);
      return eventTime >= startTime && eventTime <= endTime;
    });
  }

  /**
   * Group events by type
   */
  static groupEventsByType(events: IEvent[]): { [type: string]: IEvent[] } {
    return events.reduce((groups, event) => {
      const type = event.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(event);
      return groups;
    }, {} as { [type: string]: IEvent[] });
  }

  /**
   * Get event statistics
   */
  static getEventStatistics(events: IEvent[]): {
    totalEvents: number;
    eventTypes: string[];
    typeCount: { [type: string]: number };
    timeRange: { earliest: string; latest: string } | null;
  } {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        eventTypes: [],
        typeCount: {},
        timeRange: null
      };
    }

    const typeCount: { [type: string]: number } = {};
    events.forEach(event => {
      typeCount[event.type] = (typeCount[event.type] || 0) + 1;
    });

    const sortedEvents = EventUtils.sortEventsByUlid(events);
    
    return {
      totalEvents: events.length,
      eventTypes: Object.keys(typeCount),
      typeCount,
      timeRange: {
        earliest: sortedEvents[0].id,
        latest: sortedEvents[sortedEvents.length - 1].id
      }
    };
  }
}
