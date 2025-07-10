import { Scene } from 'phaser';
import { config } from '../config';
import Machine from '../objects/machine';
import Button from '../objects/button';
import PayTable from '../objects/payTable';
import DebugBar from '../objects/debugBar';
import {
  eventManager,
  GameInitializedEvent,
  BalanceChangedEvent,
  SpinStartedEvent,
  ButtonClickedEvent,
  BalanceInsufficientEvent,
  EVENT_TYPES,
  LogLevel
} from '../events';

export default class GameScene extends Scene {
  private balance!: number;
  private machine!: Machine;
  private spinButton!: Button;
  private balanceText!: Phaser.GameObjects.BitmapText;
  private debugBar!: DebugBar;
  private eventSubscriptions: any[] = [];
  private isEventSystemInitialized = false;

  constructor() {
    super({ key: 'Game' });
  }

  init(): void {
    this.balance = config.payTable.startBalance;

    // Initialize event system
    this._initializeEventSystem();

    this._addSlotMachine();
    this._addBalanceBlock();
    this._addSpinButton();
    this._addPayTable();
    this._addDebugBar();

    // Emit game initialized event
    eventManager.emit(new GameInitializedEvent({
      scene: 'Game',
      config: config
    }));
  }

  private _initializeEventSystem(): void {
    // Only initialize once
    if (this.isEventSystemInitialized) {
      return;
    }

    // Initialize the event manager with this scene
    eventManager.initialize(this, {
      enableDebugLogging: true,
      debugLogLevel: 'basic',
      enableAdvancedLogging: true,
      enableDebugConsole: true,
      logLevel: LogLevel.INFO
    });

    // Setup event subscriptions for this scene
    this._setupEventSubscriptions();
    this.isEventSystemInitialized = true;
  }

  private _setupEventSubscriptions(): void {
    // Clear any existing subscriptions first
    this._cleanupEventSubscriptions();

    // Subscribe to balance change events for logging/analytics only (UI is updated directly in _updateBalance)
    const balanceSubscription = eventManager.subscribe(EVENT_TYPES.BALANCE_CHANGED, (event: BalanceChangedEvent) => {
      // Log balance changes for debugging/analytics
      console.log(`[GameScene] Balance changed: ${event.data.previousBalance} -> ${event.data.newBalance} (${event.data.reason})`);
    });
    this.eventSubscriptions.push(balanceSubscription);

    // Subscribe to spin completed events
    const spinSubscription = eventManager.subscribe(EVENT_TYPES.SPIN_COMPLETED, () => {
      this._checkResults();
    });
    this.eventSubscriptions.push(spinSubscription);

    // Subscribe to button click events
    const buttonSubscription = eventManager.subscribe(EVENT_TYPES.BUTTON_CLICKED, (event: ButtonClickedEvent) => {
      if (event.data.buttonType === 'spin') {
        this._handleSpinButtonClick();
      }
    });
    this.eventSubscriptions.push(buttonSubscription);
  }

  private _cleanupEventSubscriptions(): void {
    this.eventSubscriptions.forEach(subscription => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    this.eventSubscriptions = [];
  }

  private _addSlotMachine(): void {
    this.machine = new Machine(this, 
      config.size.centerX, 
      config.size.centerY - 100, 
      config.game,
      config.payTable.payment);
  }

  private _addSpinButton(): void {
    this.spinButton = new Button(this,
      config.size.centerX + config.game.spinButtonOffset.x,
      config.size.centerY + config.game.spinButtonOffset.y,
      config.game.atlasName,
      config.game.sprites.spinButton,
      'spin',
      'main-spin-button'
    );
    // Remove direct event handling - will be handled through event system
    this.spinButton.on('pointerup', () => {
      eventManager.emit(new ButtonClickedEvent({
        buttonType: 'spin',
        buttonId: 'main-spin-button',
        position: { x: this.spinButton.x, y: this.spinButton.y }
      }));
    });
  }

  private _handleSpinButtonClick(): void {
    if (!this.machine.locked) {
      // Check if player has sufficient balance
      if (this.balance < 1) {
        eventManager.emit(new BalanceInsufficientEvent({
          currentBalance: this.balance,
          requiredAmount: 1
        }));
        return;
      }

      // Emit spin started event
      eventManager.emit(new SpinStartedEvent({
        betAmount: 1,
        balance: this.balance,
        debugSlots: this.debugBar.debugSlots
      }));

      // Start the machine spin
      this.machine.setResultSlots(this.debugBar.debugSlots);
      this.machine.startSpin();
      this.spinButton.disable();

      // Update balance
      this._updateBalance(-1);
    }
  }

  private _checkResults(): void {
    if (this.machine.winSum) {
      this._updateBalance(this.machine.winSum);
    }
  }

  private _addBalanceBlock(): void {
    this.add.sprite(
      config.size.centerX + config.game.spinButtonOffset.x,
      config.size.centerY + config.game.spinButtonOffset.y - 5,
      config.game.atlasName,
      config.game.sprites.balanceBg
    ).setOrigin(1, 0.5);

    this.balanceText = this.add.bitmapText(
      config.size.centerX + config.game.balanceTextOffsetX,
      config.size.centerY + config.game.balanceTextOffsetY,
      'freedom', `$ ${this.balance}`, 56
    ).setOrigin(0, 0.5);
    
    this.add.bitmapText(
      config.size.centerX + config.game.balanceCommentOffsetX,
      config.size.centerY + config.game.balanceCommentOffsetY,
      'freedom', 'Each spin costs 1 coin', 18
    ).setOrigin(0, 0.5);
  }

  private _updateBalance(change: number): void {
    const previousBalance = this.balance;
    this.balance += change;

    // Update the display immediately to avoid event loops
    if (this.balanceText) {
      this.balanceText.setText(`$ ${this.balance}`);
    }

    // Emit balance changed event (other systems can listen to this)
    eventManager.emit(new BalanceChangedEvent({
      previousBalance,
      newBalance: this.balance,
      change,
      reason: change > 0 ? 'win' : 'bet'
    }));
  }

  private _addPayTable(): void {
    new PayTable(this, config.payTable);
  }

  private _addDebugBar(): void {
    this.debugBar = new DebugBar(this, config);
  }

  override update(): void {
    // Only enable button if machine is not locked and button is currently disabled
    if (!this.machine.locked && this.spinButton.disabled) {
      this.spinButton.enable();
    }
  }

  create(): void {
    // Setup UI references for event handlers after init
    const uiHandler = eventManager.getUIHandler();
    if (uiHandler && this.balanceText && this.spinButton) {
      uiHandler.setUIReferences(this.balanceText, this.spinButton);
    }
  }

  shutdown(): void {
    // Cleanup event subscriptions
    this._cleanupEventSubscriptions();

    // Reset initialization flag
    this.isEventSystemInitialized = false;

    // Cleanup event system when scene is shut down
    eventManager.destroy();
  }
}
