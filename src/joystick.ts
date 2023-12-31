import { distance } from "@remvst/geometry";
import { Container, Graphics } from "pixi.js";
import { Control } from "./control";
import { Touch } from "./touch";

export class Joystick implements Control {
    private _enabled = true;

    angle: number = 0;
    force: number = 0;

    readonly view = new Container();
    private readonly wiggleView = new Graphics();
    private readonly stickView = new Graphics();

    private readonly onChangeListeners: ((joystick: Joystick) => void)[] = [];

    touchIdentifier: number | null = null;

    constructor(readonly radius: number = 50) {
        this.wiggleView.beginFill(0x0, 0.5);
        this.wiggleView.lineStyle(2, 0xffffff, 0.5);
        this.wiggleView.drawCircle(0, 0, this.radius);

        this.stickView.beginFill(0xffffff);
        this.stickView.drawCircle(0, 0, 20);

        this.view.addChild(this.wiggleView, this.stickView);
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(enabled: boolean) {
        const oldValue = this._enabled;
        this._enabled = enabled;
        this.updateView();

        if (enabled !== oldValue) {
            for (const listener of this.onChangeListeners) {
                listener(this);
            }
        }
    }

    update(touches: Touch[]) {
        let isTouchingJoystick = false;

        const oldAngle = this.angle;
        const oldForce = this.force;

        const center = this.view.position;

        if (this.enabled) {
            for (const touch of touches) {
                const { position, identifier, claimedBy } = touch;
                if (claimedBy && claimedBy !== this) continue;

                const distanceToJoystick = distance(position, center);
                if (
                    identifier === this.touchIdentifier ||
                    distanceToJoystick < this.radius + 30
                ) {
                    isTouchingJoystick = true;
                    this.touchIdentifier = identifier;
                    touch.claimedBy = this;

                    const angle = Math.atan2(
                        position.y - center.y,
                        position.x - center.x,
                    );
                    this.force = Math.min(1, distanceToJoystick / this.radius);
                    this.angle = angle;
                }
            }
        }

        if (!isTouchingJoystick) {
            this.force = 0;
            this.touchIdentifier = null;
        }

        this.updateView();

        if (this.angle !== oldAngle || this.force !== oldForce) {
            for (const listener of this.onChangeListeners) {
                listener(this);
            }
        }
    }

    updateView() {
        this.view.visible = this.enabled;
        this.stickView.position.set(
            Math.cos(this.angle) * this.force * this.radius,
            Math.sin(this.angle) * this.force * this.radius,
        );
    }

    onChange(listener: (control: Joystick) => void): void {
        this.onChangeListeners.push(listener);
    }
}
