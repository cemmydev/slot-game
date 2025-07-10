import { BaseEvent } from './IEvent';

export const EVENT_TYPES = {
  GAME_INITIALIZED: 'game:initialized',
  GAME_STATE_CHANGED: 'game:state_changed',
  SPIN_STARTED: 'spin:started',
  SPIN_COMPLETED: 'spin:completed',
  REEL_STOPPED: 'reel:stopped',
  WIN_DETECTED: 'win:detected',
  WIN_CALCULATED: 'win:calculated',
  WIN_ANIMATION_STARTED: 'win:animation_started',
  WIN_ANIMATION_COMPLETED: 'win:animation_completed',
  BALANCE_CHANGED: 'balance:changed',
  BALANCE_INSUFFICIENT: 'balance:insufficient',
  BUTTON_CLICKED: 'ui:button_clicked',
  BUTTON_STATE_CHANGED: 'ui:button_state_changed',
  DEBUG_MODE_TOGGLED: 'debug:mode_toggled',
  DEBUG_SLOTS_CHANGED: 'debug:slots_changed',
  ASSETS_LOADED: 'system:assets_loaded',
  ERROR_OCCURRED: 'system:error'
} as const;

export class GameInitializedEvent extends BaseEvent {
  constructor(data: { scene: string; config: any }) {
    super(EVENT_TYPES.GAME_INITIALIZED, data, 'GameScene');
  }
}

export class GameStateChangedEvent extends BaseEvent {
  constructor(data: { previousState: string; newState: string; context?: any }) {
    super(EVENT_TYPES.GAME_STATE_CHANGED, data, 'GameScene');
  }
}

export class SpinStartedEvent extends BaseEvent {
  constructor(data: { betAmount: number; balance: number; debugSlots?: any }) {
    super(EVENT_TYPES.SPIN_STARTED, data, 'Machine');
  }
}

export class SpinCompletedEvent extends BaseEvent {
  constructor(data: { results: string[][]; winAmount: number; winLines: number[] }) {
    super(EVENT_TYPES.SPIN_COMPLETED, data, 'Machine');
  }
}

export class ReelStoppedEvent extends BaseEvent {
  constructor(data: { reelIndex: number; result: string[]; totalReels: number }) {
    super(EVENT_TYPES.REEL_STOPPED, data, 'Reel');
  }
}

export class WinDetectedEvent extends BaseEvent {
  constructor(data: { winAmount: number; winLines: number[]; combination: string[] }) {
    super(EVENT_TYPES.WIN_DETECTED, data, 'Machine');
  }
}

export class WinCalculatedEvent extends BaseEvent {
  constructor(data: { totalWin: number; lineWins: Array<{ line: number; amount: number; symbols: string[] }> }) {
    super(EVENT_TYPES.WIN_CALCULATED, data, 'Machine');
  }
}

export class WinAnimationStartedEvent extends BaseEvent {
  constructor(data: { winAmount: number; animationType: string }) {
    super(EVENT_TYPES.WIN_ANIMATION_STARTED, data, 'AnimationHandler');
  }
}

export class WinAnimationCompletedEvent extends BaseEvent {
  constructor(data: { winAmount: number; animationType: string }) {
    super(EVENT_TYPES.WIN_ANIMATION_COMPLETED, data, 'AnimationHandler');
  }
}

export class BalanceChangedEvent extends BaseEvent {
  constructor(data: { previousBalance: number; newBalance: number; change: number; reason: string }) {
    super(EVENT_TYPES.BALANCE_CHANGED, data, 'GameScene');
  }
}

export class BalanceInsufficientEvent extends BaseEvent {
  constructor(data: { currentBalance: number; requiredAmount: number }) {
    super(EVENT_TYPES.BALANCE_INSUFFICIENT, data, 'GameScene');
  }
}

export class ButtonClickedEvent extends BaseEvent {
  constructor(data: { buttonType: string; buttonId?: string; position?: { x: number; y: number } }) {
    super(EVENT_TYPES.BUTTON_CLICKED, data, 'Button');
  }
}

export class ButtonStateChangedEvent extends BaseEvent {
  constructor(data: { buttonType: string; buttonId?: string; previousState: string; newState: string }) {
    super(EVENT_TYPES.BUTTON_STATE_CHANGED, data, 'Button');
  }
}

export class DebugModeToggledEvent extends BaseEvent {
  constructor(data: { enabled: boolean; mode?: string }) {
    super(EVENT_TYPES.DEBUG_MODE_TOGGLED, data, 'DebugBar');
  }
}

export class DebugSlotsChangedEvent extends BaseEvent {
  constructor(data: { slots: any[][]; fixedMode: boolean }) {
    super(EVENT_TYPES.DEBUG_SLOTS_CHANGED, data, 'DebugBar');
  }
}

export class AssetsLoadedEvent extends BaseEvent {
  constructor(data: { assetType: string; assetCount: number; totalSize?: number }) {
    super(EVENT_TYPES.ASSETS_LOADED, data, 'PreloadScene');
  }
}

export class ErrorOccurredEvent extends BaseEvent {
  constructor(data: { error: Error; context: string; severity: 'low' | 'medium' | 'high' | 'critical' }) {
    super(EVENT_TYPES.ERROR_OCCURRED, data, 'System');
  }
}
