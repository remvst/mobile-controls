import { Joystick } from "./joystick";
import { Touch } from "./touch";

export class DynamicJoystick extends Joystick {
    update(touches: Touch[]): void {
        for (const touch of touches) {
            if (touch.claimedBy) continue;

            touch.claimedBy = this;
            this.view.position.copyFrom(touch.position);
            this.notifyChanged();
        }

        let visible = false;
        for (const touch of touches) {
            if (touch.claimedBy === this) {
                visible = true;
            }
        }

        console.log(visible);

        if (visible !== this.view.visible) {
            this.view.visible = visible;
            this.notifyChanged();
        }

        super.update(touches);
    }

    updateView() {
        super.updateView();
        this.view.visible = this.force > 0;
    }
}
