import { distance } from "@remvst/geometry";
import { Button } from "./button";
import { MobileControls } from "./mobile-controls";
import { addEventListener, mapAndUpdateTouches } from "./utils";

export class MobileControlsMouseHandler {
    private readonly listeners: (() => void)[] = [];

    constructor(
        private readonly controls: MobileControls,
        private readonly element: HTMLElement,
    ) {}

    setup() {
        let mouseDown = false;

        // Handle cursor changes
        this.listeners.push(
            addEventListener(document.body, "mousemove", (event) => {
                this.controls.hoveringControl = null;

                const position = { x: event.pageX, y: event.pageY };
                for (const control of this.controls.controls) {
                    if (
                        control.enabled &&
                        control instanceof Button &&
                        distance(control.view.position, position) <
                            control.radius
                    ) {
                        this.controls.hoveringControl = control;
                        break;
                    }
                }

                this.element.style.cursor = this.controls.hoveringControl
                    ? "pointer"
                    : "inherit";
            }),
            addEventListener(document.body, "mousedown", (event) => {
                mouseDown = true;
                mapAndUpdateTouches(this.element, this.controls, [
                    event,
                ] as any as TouchList);
            }),
            addEventListener(document.body, "mousemove", (event) => {
                if (mouseDown)
                    mapAndUpdateTouches(this.element, this.controls, [
                        event,
                    ] as any as TouchList);
            }),
            addEventListener(document.body, "mouseup", (event) => {
                mouseDown = false;
                mapAndUpdateTouches(
                    this.element,
                    this.controls,
                    [] as any as TouchList,
                );
            }),
        );
    }

    destroy() {
        for (const listener of this.listeners) {
            listener();
        }
        this.listeners.splice(0, this.listeners.length);
    }
}
