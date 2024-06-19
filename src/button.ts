import { Rectangle, Vector2Like, distance } from "@remvst/geometry";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { Control } from "./control";
import { Touch } from "./touch";
import { EventHub } from "./event-emitter";

export class Button implements Control {
    readonly view = new Container();
    readonly shapeView = (() => {
        const view = new Graphics();
        view.beginFill(0xffffff, 0.5);
        view.drawCircle(0, 0, this.radius);
        return view;
    })();
    readonly outline = (() => {
        const view = new Graphics();
        view.lineStyle({ color: 0xffffff, width: 2 });
        view.drawCircle(0, 0, this.radius);
        return view;
    })();
    readonly iconView = (() => {
        const view = new Sprite();
        view.texture = this.icon;
        view.width = this.radius * 2;
        view.height = this.radius * 2;
        view.anchor.set(0.5, 0.5);
        return view;
    })();

    #enabled = true;
    #hovered = false;

    isDown = false;

    retainsTouches = true;

    readonly onDownStateChanged = new EventHub<boolean>();
    readonly onClick = new EventHub();
    readonly onChange = new EventHub();

    touchIdentifier: number | null = null;
    touchArea: Rectangle | null = null;

    constructor(
        readonly icon: Texture,
        readonly radius: number = 35,
    ) {
        icon.on("update", () => this.onChange.emit());

        this.view.addChild(this.shapeView, this.iconView, this.outline);
    }

    get position(): Vector2Like {
        return this.view.position;
    }

    get width() {
        return this.radius * 2;
    }

    get height() {
        return this.radius * 2;
    }

    get enabled() {
        return this.#enabled;
    }

    set enabled(enabled: boolean) {
        const oldValue = this.#enabled;
        this.#enabled = enabled;
        this.updateView();

        if (enabled !== oldValue) {
            this.onChange.emit();
        }
    }

    get hovered() {
        return this.#hovered;
    }

    set hovered(hovered: boolean) {
        const oldValue = this.#hovered;
        this.#hovered = hovered;
        this.updateView();

        if (hovered !== oldValue) {
            this.onChange.emit();
        }
    }

    update(touches: Touch[], previousTouchIdentifiers: Set<number>) {
        const center = this.view.position;

        const wasDown = this.isDown;
        const previousTouchIdentifier = this.touchIdentifier;
        let previousTouchIdentifierWasSeen = false;
        let isTouched = false;

        this.isDown = false;

        if (this.enabled) {
            for (const touch of touches) {
                const { position, identifier, claimedBy } = touch;
                if (claimedBy && claimedBy !== this) continue;

                if (touch.identifier === previousTouchIdentifier) {
                    previousTouchIdentifierWasSeen = true;
                }

                const isNewTouch = !previousTouchIdentifiers.has(identifier);

                const touchContained = this.touchArea
                    ? this.touchArea?.containsPoint(position)
                    : distance(position, center) < this.radius;

                let claimTouch = false;

                if (identifier === this.touchIdentifier) {
                    if (this.retainsTouches || touchContained) {
                        claimTouch = true;
                    }
                } else if (touchContained && isNewTouch) {
                    claimTouch = true;
                }

                if (claimTouch) {
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
            this.onDownStateChanged.emit(this.isDown);

            if (wasDown && !previousTouchIdentifierWasSeen) {
                this.onClick.emit();
            }

            this.onChange.emit();
        }

        this.updateView();
    }

    updateView() {
        this.view.visible = this.enabled;
        this.shapeView.tint = this.isDown ? 0xffffff : 0x0;
        this.outline.visible = this.hovered;
        this.iconView.tint = this.isDown ? 0x0 : 0xffffff;
    }
}
