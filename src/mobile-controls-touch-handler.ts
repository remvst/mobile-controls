import { MobileControls } from "./mobile-controls";
import { addEventListener, mapAndUpdateTouches } from "./utils";

export class MobileControlsTouchHandler {
    private readonly listeners: (() => void)[] = [];

    constructor(
        private readonly controls: MobileControls,
        private readonly element: HTMLElement,
    ) {}

    setup() {
        this.listeners.push(
            addEventListener(this.element, "contextmenu", (event) =>
                event.preventDefault(),
            ),
            addEventListener(this.element, "touchstart", (event) =>
                this.onTouchEvent(event),
            ),
            addEventListener(this.element, "touchmove", (event) =>
                this.onTouchEvent(event),
            ),
            addEventListener(this.element, "touchend", (event) =>
                this.onTouchEvent(event),
            ),
            addEventListener(this.element, "touchcancel", (event) =>
                this.onTouchEvent(event),
            ),
        );
    }

    destroy() {
        for (const listener of this.listeners) {
            listener();
        }
    }

    private onTouchEvent(event: TouchEvent) {
        if (this.controls.stage.destroyed) return;
        event.preventDefault();
        event.stopPropagation();

        mapAndUpdateTouches(this.element, this.controls, event.touches);
    }
}
