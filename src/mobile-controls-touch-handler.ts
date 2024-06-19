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
            addEventListener(document.body, "contextmenu", (event) =>
                event.preventDefault(),
            ),
            addEventListener(document.body, "touchstart", (event) =>
                this.onTouchEvent(event),
            ),
            addEventListener(document.body, "touchmove", (event) =>
                this.onTouchEvent(event),
            ),
            addEventListener(document.body, "touchend", (event) =>
                this.onTouchEvent(event),
            ),
            addEventListener(document.body, "touchcancel", (event) =>
                this.onTouchEvent(event),
            ),
        );
    }

    destroy() {
        for (const listener of this.listeners) {
            listener();
        }
        this.listeners.splice(0, this.listeners.length);
    }

    private onTouchEvent(event: TouchEvent) {
        if (this.controls.stage.destroyed) return;
        event.preventDefault();
        event.stopPropagation();

        mapAndUpdateTouches(this.element, this.controls, event.touches);
    }
}
