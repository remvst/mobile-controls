import { Rectangle } from "@remvst/geometry";
import { Joystick } from "./joystick";
import { Touch } from "./touch";

export class DynamicJoystick extends Joystick {

    readonly claimArea = new Rectangle();

    update(touches: Touch[], previousTouchIdentifiers: Set<number>): void {
        if (!this.isActive) {
            for (const touch of touches) {
                if (previousTouchIdentifiers.has(touch.identifier)) continue; // Not a new touch
                if (touch.claimedBy) continue; // Already claimed by another control
                if (!this.claimArea.containsPoint(touch.position)) continue; // Not in our claim area

                touch.claimedBy = this;
                this.view.position.copyFrom(touch.position);
                this.notifyChanged();
            }
        }

        super.update(touches, previousTouchIdentifiers);
    }

    updateView() {
        super.updateView();
        this.view.visible = this.isActive;
    }

    get isActive(): boolean {
        return this.force > 0;
    }
}
