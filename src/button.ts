import { Rectangle, distance } from "@remvst/geometry";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { Control } from "./control";
import { MobileControls } from "./mobile-controls";
import { Touch } from "./touch";

export class Button implements Control {
    readonly view = new Container();
    private readonly shapeView = new Graphics();
    private readonly iconView = new Sprite();

    parent: MobileControls = null!;

    private _enabled = true;
    isDown = false;

    onDownStateChanged: (down: boolean) => void = () => {};

    private readonly onChangeListeners: ((button: Button) => void)[] = [];

    touchIdentifier: number | null = null;
    touchArea: Rectangle | null = null;

    constructor(
        icon: Texture,
        readonly radius: number = 35,
    ) {
        this.shapeView.beginFill(0xffffff, 0.5);
        this.shapeView.drawCircle(0, 0, this.radius);

        icon.on('update', () => {
            for (const listener of this.onChangeListeners) {
                listener(this);
            }
        });

        this.iconView.texture = icon;
        this.iconView.width = radius * 2;
        this.iconView.height = radius * 2;
        this.iconView.anchor.set(0.5, 0.5);

        this.view.addChild(this.shapeView, this.iconView);
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
        const center = this.view.position;

        const wasDown = this.isDown;
        let isTouched = false;

        this.isDown = false;

        if (this.enabled) {
            for (const touch of touches) {
                const { position, identifier, claimedBy } = touch;
                if (claimedBy && claimedBy !== this) continue;

                const touchContained = this.touchArea
                    ? this.touchArea?.containsPoint(position)
                    : distance(position, center) < this.radius;
                if (identifier === this.touchIdentifier || touchContained) {
                    isTouched = true;
                    this.isDown = true;
                    this.touchIdentifier = identifier;
                    touch.claimedBy = this;
                }
            }
        }

        if (!isTouched) {
            this.touchIdentifier = null;
        }

        if (this.isDown !== wasDown) {
            this.onDownStateChanged(this.isDown);
            for (const listener of this.onChangeListeners) {
                listener(this);
            }
        }

        this.updateView();
    }

    updateView() {
        this.view.visible = this.enabled;
        this.shapeView.tint = this.isDown ? 0xffffff : 0x0;
        this.iconView.tint = this.isDown ? 0x0 : 0xffffff;
    }

    onChange(listener: (control: Button) => void): void {
        this.onChangeListeners.push(listener);
    }
}
