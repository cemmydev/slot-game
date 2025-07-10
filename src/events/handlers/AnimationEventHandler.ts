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

export class AnimationEventHandler extends BaseEventHandler {
  private scene: Scene;
  private activeAnimations: Phaser.Tweens.Tween[] = [];

  constructor(eventBus: EventBus, scene: Scene) {
    super(eventBus);
    this.scene = scene;
  }

  protected override setupSubscriptions(): void {
    this.subscribe<WinDetectedEvent>(EVENT_TYPES.WIN_DETECTED, (event) => {
      this.playWinAnimation(event.data);
    });

    this.subscribe<SpinStartedEvent>(EVENT_TYPES.SPIN_STARTED, (_event) => {
      this.playSpinStartAnimation();
    });

    this.subscribe<SpinCompletedEvent>(EVENT_TYPES.SPIN_COMPLETED, (_event) => {
      this.playSpinCompleteAnimation();
    });

    this.subscribe<ReelStoppedEvent>(EVENT_TYPES.REEL_STOPPED, (event) => {
      this.playReelStopAnimation(event.data);
    });
  }

  handle(event: IEvent): void {
    console.log(`[AnimationEventHandler] Received event: ${event.type}`);
  }

  private playWinAnimation(data: { winAmount: number; winLines: number[]; combination: string[] }): void {
    this.eventBus.emit(new WinAnimationStartedEvent({
      winAmount: data.winAmount,
      animationType: 'celebration'
    }));

    this.createWinCelebration(data.winAmount);
    this.highlightWinLines(data.winLines);

    this.scene.time.delayedCall(2000, () => {
      this.eventBus.emit(new WinAnimationCompletedEvent({
        winAmount: data.winAmount,
        animationType: 'celebration'
      }));
    });
  }

  private playSpinStartAnimation(): void {
    this.scene.cameras.main.shake(100, 0.01);
    console.log('[AnimationEventHandler] Playing spin start animation');
  }

  private playSpinCompleteAnimation(): void {
    console.log('[AnimationEventHandler] Playing spin complete animation');
  }

  private playReelStopAnimation(data: { reelIndex: number; result: string[]; totalReels: number }): void {
    console.log(`[AnimationEventHandler] Reel ${data.reelIndex} stopped`);
  }

  private createWinCelebration(winAmount: number): void {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    for (let i = 0; i < 10; i++) {
      const star = this.scene.add.graphics();
      star.fillStyle(0xFFD700);
      const starPoints = this.createStarPoints(0, 0, 5, 10, 20);
      star.fillPoints(starPoints);
      star.setPosition(
        centerX + (Math.random() - 0.5) * 200,
        centerY + (Math.random() - 0.5) * 200
      );

      const tween = this.scene.tweens.add({
        targets: star,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        rotation: Math.PI * 2,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });

      this.activeAnimations.push(tween);
    }

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
      onComplete: () => winText.destroy()
    });

    this.activeAnimations.push(textTween);
  }

  private createStarPoints(x: number, y: number, points: number, innerRadius: number, outerRadius: number): Phaser.Geom.Point[] {
    const starPoints: Phaser.Geom.Point[] = [];
    const angle = Math.PI / points;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const currentAngle = i * angle;
      starPoints.push(new Phaser.Geom.Point(
        x + Math.cos(currentAngle) * radius,
        y + Math.sin(currentAngle) * radius
      ));
    }

    return starPoints;
  }

  private highlightWinLines(winLines: number[]): void {
    console.log('[AnimationEventHandler] Highlighting win lines:', winLines);
  }

  stopAllAnimations(): void {
    this.activeAnimations.forEach(tween => {
      if (tween && tween.isActive()) {
        tween.stop();
      }
    });
    this.activeAnimations = [];
  }

  override canHandle(event: IEvent): boolean {
    const animationEvents = [
      EVENT_TYPES.WIN_DETECTED,
      EVENT_TYPES.SPIN_STARTED,
      EVENT_TYPES.SPIN_COMPLETED,
      EVENT_TYPES.REEL_STOPPED
    ];

    return animationEvents.includes(event.type as any);
  }

  override destroy(): void {
    this.stopAllAnimations();
    super.destroy();
  }
}
