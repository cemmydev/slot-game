import { Scene } from 'phaser';
import { BaseEventHandler } from './BaseEventHandler';
import { IEvent } from '../IEvent';
import { EventBus } from '../EventBus';
import { 
  EVENT_TYPES, 
  WinDetectedEvent,
  SpinStartedEvent,
  SpinCompletedEvent,
  ReelStoppedEvent,
  WinAnimationStartedEvent,
  WinAnimationCompletedEvent
} from '../GameEvents';

/**
 * Handles animations based on game events
 */
export class AnimationEventHandler extends BaseEventHandler {
  private scene: Scene;
  private activeAnimations: Phaser.Tweens.Tween[] = [];

  constructor(eventBus: EventBus, scene: Scene) {
    super(eventBus);
    this.scene = scene;
  }

  /**
   * Setup specific event subscriptions for animations
   */
  protected setupSubscriptions(): void {
    // Win animations
    this.subscribe<WinDetectedEvent>(EVENT_TYPES.WIN_DETECTED, (event) => {
      this.playWinAnimation(event.data);
    });

    // Spin animations
    this.subscribe<SpinStartedEvent>(EVENT_TYPES.SPIN_STARTED, (event) => {
      this.playSpinStartAnimation();
    });

    this.subscribe<SpinCompletedEvent>(EVENT_TYPES.SPIN_COMPLETED, (event) => {
      this.playSpinCompleteAnimation();
    });

    // Reel stop animations
    this.subscribe<ReelStoppedEvent>(EVENT_TYPES.REEL_STOPPED, (event) => {
      this.playReelStopAnimation(event.data);
    });
  }

  /**
   * Handle any event (fallback)
   */
  handle(event: IEvent): void {
    // This method is called for events not handled by specific subscriptions
    console.log(`[AnimationEventHandler] Received event: ${event.type}`);
  }

  /**
   * Play win animation
   */
  private playWinAnimation(data: { winAmount: number; winLines: number[]; combination: string[] }): void {
    // Emit win animation started event
    this.eventBus.emit(new WinAnimationStartedEvent({
      winAmount: data.winAmount,
      animationType: 'celebration'
    }));

    // Create celebration particles or effects
    this.createWinCelebration(data.winAmount);

    // Highlight winning lines
    this.highlightWinLines(data.winLines);

    // Schedule completion event
    this.scene.time.delayedCall(2000, () => {
      this.eventBus.emit(new WinAnimationCompletedEvent({
        winAmount: data.winAmount,
        animationType: 'celebration'
      }));
    });
  }

  /**
   * Play spin start animation
   */
  private playSpinStartAnimation(): void {
    // Add screen shake or other effects when spin starts
    this.scene.cameras.main.shake(100, 0.01);
    
    // Could add UI dimming or other visual feedback
    console.log('[AnimationEventHandler] Playing spin start animation');
  }

  /**
   * Play spin complete animation
   */
  private playSpinCompleteAnimation(): void {
    // Add effects when spin completes
    console.log('[AnimationEventHandler] Playing spin complete animation');
  }

  /**
   * Play reel stop animation
   */
  private playReelStopAnimation(data: { reelIndex: number; result: string[]; totalReels: number }): void {
    // Add bounce effect or other feedback when reel stops
    console.log(`[AnimationEventHandler] Reel ${data.reelIndex} stopped`);
    
    // Could add individual reel stop effects here
  }

  /**
   * Create win celebration effects
   */
  private createWinCelebration(winAmount: number): void {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    // Create multiple celebration elements
    for (let i = 0; i < 10; i++) {
      const star = this.scene.add.graphics();
      star.fillStyle(0xFFD700);
      star.fillStar(0, 0, 5, 10, 20);
      star.setPosition(
        centerX + (Math.random() - 0.5) * 200,
        centerY + (Math.random() - 0.5) * 200
      );

      // Animate stars
      const tween = this.scene.tweens.add({
        targets: star,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        rotation: Math.PI * 2,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          star.destroy();
        }
      });

      this.activeAnimations.push(tween);
    }

    // Create win amount text animation
    const winText = this.scene.add.bitmapText(
      centerX,
      centerY - 50,
      'freedom',
      `+$${winAmount}`,
      48
    ).setOrigin(0.5).setTint(0x00FF00);

    const textTween = this.scene.tweens.add({
      targets: winText,
      y: centerY - 100,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        winText.destroy();
      }
    });

    this.activeAnimations.push(textTween);
  }

  /**
   * Highlight winning lines
   */
  private highlightWinLines(winLines: number[]): void {
    // This would highlight the winning paylines
    // Implementation depends on how paylines are visually represented
    console.log('[AnimationEventHandler] Highlighting win lines:', winLines);
  }

  /**
   * Stop all active animations
   */
  stopAllAnimations(): void {
    this.activeAnimations.forEach(tween => {
      if (tween && tween.isActive()) {
        tween.stop();
      }
    });
    this.activeAnimations = [];
  }

  /**
   * Check if this handler can handle the event
   */
  canHandle(event: IEvent): boolean {
    const animationEvents = [
      EVENT_TYPES.WIN_DETECTED,
      EVENT_TYPES.SPIN_STARTED,
      EVENT_TYPES.SPIN_COMPLETED,
      EVENT_TYPES.REEL_STOPPED
    ];
    
    return animationEvents.includes(event.type as any);
  }

  /**
   * Cleanup when handler is destroyed
   */
  destroy(): void {
    this.stopAllAnimations();
    super.destroy();
  }
}
