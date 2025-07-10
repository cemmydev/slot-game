import { Scene } from 'phaser';
import { BaseEventHandler } from './BaseEventHandler';
import { IEvent } from '../IEvent';
import { EventBus } from '../EventBus';
import { 
  EVENT_TYPES, 
  BalanceChangedEvent, 
  ButtonStateChangedEvent,
  SpinStartedEvent,
  SpinCompletedEvent,
  WinDetectedEvent
} from '../GameEvents';

/**
 * Handles UI updates based on game events
 */
export class UIEventHandler extends BaseEventHandler {
  private scene: Scene;
  private balanceText?: Phaser.GameObjects.BitmapText;
  private spinButton?: any; // Button reference

  constructor(eventBus: EventBus, scene: Scene) {
    super(eventBus);
    this.scene = scene;
  }

  /**
   * Set UI element references
   */
  setUIReferences(balanceText: Phaser.GameObjects.BitmapText, spinButton: any): void {
    this.balanceText = balanceText;
    this.spinButton = spinButton;
  }

  /**
   * Setup specific event subscriptions for UI updates
   */
  protected override setupSubscriptions(): void {
    // Balance changes
    this.subscribe<BalanceChangedEvent>(EVENT_TYPES.BALANCE_CHANGED, (event) => {
      this.updateBalanceDisplay(event.data.newBalance);
    });

    // Button state changes
    this.subscribe<ButtonStateChangedEvent>(EVENT_TYPES.BUTTON_STATE_CHANGED, (event) => {
      this.updateButtonState(event.data.buttonType, event.data.newState);
    });

    // Spin events
    this.subscribe<SpinStartedEvent>(EVENT_TYPES.SPIN_STARTED, (event) => {
      this.onSpinStarted();
    });

    this.subscribe<SpinCompletedEvent>(EVENT_TYPES.SPIN_COMPLETED, (event) => {
      this.onSpinCompleted(event.data);
    });

    // Win events
    this.subscribe<WinDetectedEvent>(EVENT_TYPES.WIN_DETECTED, (event) => {
      this.onWinDetected(event.data);
    });
  }

  /**
   * Handle any event (fallback)
   */
  handle(event: IEvent): void {
    // This method is called for events not handled by specific subscriptions
    // Can be used for logging or general UI updates
    console.log(`[UIEventHandler] Received event: ${event.type}`);
  }

  /**
   * Update balance display
   */
  private updateBalanceDisplay(newBalance: number): void {
    if (this.balanceText) {
      this.balanceText.setText(`$ ${newBalance}`);
      
      // Add visual feedback for balance changes
      this.scene.tweens.add({
        targets: this.balanceText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  /**
   * Update button state
   */
  private updateButtonState(buttonType: string, newState: string): void {
    if (buttonType === 'spin' && this.spinButton) {
      switch (newState) {
        case 'disabled':
          this.spinButton.disable();
          break;
        case 'enabled':
          this.spinButton.enable();
          break;
      }
    }
  }

  /**
   * Handle spin started
   */
  private onSpinStarted(): void {
    // Visual feedback for spin start
    console.log('[UIEventHandler] Spin started - updating UI');
    
    // Could add spin start animations here
    this.showSpinFeedback();
  }

  /**
   * Handle spin completed
   */
  private onSpinCompleted(data: { results: string[][]; winAmount: number; winLines: number[] }): void {
    console.log('[UIEventHandler] Spin completed - updating UI', data);
    
    // Could add spin completion animations here
    this.hideSpinFeedback();
  }

  /**
   * Handle win detected
   */
  private onWinDetected(data: { winAmount: number; winLines: number[]; combination: string[] }): void {
    console.log('[UIEventHandler] Win detected - showing win UI', data);
    
    // Add win celebration UI
    this.showWinCelebration(data.winAmount);
  }

  /**
   * Show spin feedback
   */
  private showSpinFeedback(): void {
    // Add visual feedback for spinning state
    // This could include dimming other UI elements, showing a spinner, etc.
  }

  /**
   * Hide spin feedback
   */
  private hideSpinFeedback(): void {
    // Remove spin feedback UI
  }

  /**
   * Show win celebration
   */
  private showWinCelebration(winAmount: number): void {
    // Create temporary win text
    const winText = this.scene.add.bitmapText(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      'freedom',
      `WIN! $${winAmount}`,
      72
    ).setOrigin(0.5).setTint(0xFFD700);

    // Animate win text
    this.scene.tweens.add({
      targets: winText,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        winText.destroy();
      }
    });
  }

  /**
   * Check if this handler can handle the event
   */
  override canHandle(event: IEvent): boolean {
    const uiEvents = [
      EVENT_TYPES.BALANCE_CHANGED,
      EVENT_TYPES.BUTTON_STATE_CHANGED,
      EVENT_TYPES.SPIN_STARTED,
      EVENT_TYPES.SPIN_COMPLETED,
      EVENT_TYPES.WIN_DETECTED
    ];
    
    return uiEvents.includes(event.type as any);
  }
}
