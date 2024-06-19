import { Rectangle } from "@remvst/geometry";
import { Joystick } from "./joystick";
import { Touch } from "./touch";

/**
 * Joystick that will only appear when the user starts dragging from the claim area, and disappear as soon as the user stops dragging.
 */
export class DynamicJoystick extends Joystick {
    readonly claimArea = new Rectangle();

    #fadeAnimationFrame: number | null = null;

    constructor() {
        super();
        this.view.alpha = 0;
    }

    update(touches: Touch[], previousTouchIdentifiers: Set<number>): void {
        const wasActive = this.isActive;

        if (!this.isActive) {
            for (const touch of touches) {
                if (previousTouchIdentifiers.has(touch.identifier)) continue; // Not a new touch
                if (touch.claimedBy) continue; // Already claimed by another control
                if (!this.claimArea.containsPoint(touch.position)) continue; // Not in our claim area

                touch.claimedBy = this;
                this.view.position.copyFrom(touch.position);
                this.onChange.emit();
                break;
            }
        }

        super.update(touches, previousTouchIdentifiers);

        if (this.isActive && !wasActive) {
            if (this.#fadeAnimationFrame) {
                cancelAnimationFrame(this.#fadeAnimationFrame);
                this.#fadeAnimationFrame = null;
            }

            this.view.alpha = 1;
            this.onChange.emit();
        }
    }

    protected onJoystickReleased() {
        super.onJoystickReleased();
        const start = performance.now();

        const frame = () => {
            const now = performance.now();
            const progress = Math.min((now - start) / 200, 1);
            this.view.alpha = 1 - progress;

            this.updateView();
            this.onChange.emit();

            if (progress < 1) {
                this.#fadeAnimationFrame = requestAnimationFrame(frame);
            }
        };

        frame();
    }

    updateView() {
        // if (this.isActive) {
        super.updateView();
        // }
    }
}
