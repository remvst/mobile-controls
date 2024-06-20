import { Vector2Like, distance } from "@remvst/geometry";
import { Button } from "./button";
import { Control } from "./control";
import { MobileControls } from "./mobile-controls";
import { addEventListener, mapAndUpdateTouches } from "./utils";

export class MobileControlsMouseHandler {
    private readonly listeners: (() => void)[] = [];

    hoveringControl: Control | null = null;

    constructor(
        private readonly controls: MobileControls,
        private readonly element: HTMLElement,
    ) {}

    updateHoverState(position: Vector2Like) {
        this.hoveringControl = null;

        for (const control of this.controls.controls) {
            if (
                control.enabled &&
                control instanceof Button &&
                distance(control.view.position, position) < control.radius
            ) {
                this.hoveringControl = control;
                break;
            }
        }

        for (const control of this.controls.controls) {
            if (control instanceof Button) {
                control.hovered = control === this.hoveringControl;
            }
        }

        this.element.style.cursor = this.hoveringControl
            ? "pointer"
            : "inherit";
    }

    setup() {
        let mouseDown = false;

        // Handle cursor changes
        this.listeners.push(
            addEventListener(document.body, "mousemove", (event) => {
                if (document.pointerLockElement) return;
                this.updateHoverState({ x: event.pageX, y: event.pageY });
            }),
            addEventListener(document.body, "mousedown", (event) => {
                if (document.pointerLockElement) return;
                mouseDown = true;
                mapAndUpdateTouches(this.element, this.controls, [
                    event,
                ] as any as TouchList);
            }),
            addEventListener(document.body, "mousemove", (event) => {
                if (document.pointerLockElement) return;
                if (mouseDown)
                    mapAndUpdateTouches(this.element, this.controls, [
                        event,
                    ] as any as TouchList);
            }),
            addEventListener(document.body, "mouseup", (event) => {
                if (document.pointerLockElement) return;
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
