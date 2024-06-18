import { Vector2, distance } from "@remvst/geometry";
import * as PIXI from "pixi.js";
import { Button } from "./button";
import { MobileControls } from "./mobile-controls";
import { Touch } from "./touch";

export class StandaloneMobileControlsRenderer {

    #visible = true;
    #needsRerender = true;

    view?: HTMLCanvasElement;
    private renderer?: PIXI.IRenderer<HTMLCanvasElement>;

    private readonly onWindowResizeListener = () =>
        this.resize(window.innerWidth, window.innerHeight);

    constructor(
        readonly controls: MobileControls,
        readonly includeMouseEvents: boolean = false
    ) {
    }

    private onTouchEvent(event: TouchEvent) {
        if (this.controls.stage.destroyed) return;
        event.preventDefault();
        event.stopPropagation();

        this.mapAndUpdateTouches(event.touches);
    }

    private mapAndUpdateTouches(touches: TouchList) {
        if (!this.view) return;
        if (this.controls.stage.destroyed) return;

        const rect = this.view.getBoundingClientRect();

        const mapped: Touch[] = [];

        for (const touch of touches) {
            const relativeX =
                (touch.pageX - rect.left) / (rect.right - rect.left);
            const relativeY =
                (touch.pageY - rect.top) / (rect.bottom - rect.top);

            mapped.push({
                identifier: touch.identifier,
                position: new Vector2(
                    relativeX * this.controls.width,
                    relativeY * this.controls.height,
                ),
                claimedBy: null,
            });
        }

        this.controls.updateTouches(mapped);
    }

    setup(): void {
        for (const control of this.controls.controls) {
            control.onChange(() => this.setNeedsRerender());
        }

        this.renderer = PIXI.autoDetectRenderer<HTMLCanvasElement>({
            width: 1,
            height: 1,
            resolution: 1,
            antialias: true,
            backgroundAlpha: 0,
            clearBeforeRender: true,
        });
        this.view = this.renderer.view;

        this.view.style.position = "absolute";
        this.view.style.zIndex = "99";
        this.view.style.left =
            this.view.style.right =
            this.view.style.top =
            this.view.style.bottom =
                "0px";
        this.view.style.width = "100%";
        this.view.style.height = "100%";

        window.addEventListener("resize", this.onWindowResizeListener);

        this.view.addEventListener("contextmenu", (event) =>
            event.preventDefault(),
        );
        this.view.addEventListener("touchstart", (event) =>
            this.onTouchEvent(event),
        );
        this.view.addEventListener("touchmove", (event) =>
            this.onTouchEvent(event),
        );
        this.view.addEventListener("touchend", (event) =>
            this.onTouchEvent(event),
        );
        this.view.addEventListener("touchcancel", (event) =>
            this.onTouchEvent(event),
        );

        // Pointer cursor handling
        this.view.addEventListener("mousemove", (event) => {
            this.controls.hoveringControl = null;

            const position = { x: event.pageX, y: event.pageY };
            for (const control of this.controls.controls) {
                if (
                    control.enabled &&
                    control instanceof Button &&
                    distance(control.view.position, position) < control.radius
                ) {
                    this.controls.hoveringControl = control;
                    break;
                }
            }

            if (!this.view) return;

            this.view.style.cursor = this.controls.hoveringControl
                ? "pointer"
                : "inherit";
        });

        if (this.includeMouseEvents) {
            // Fake touches based on mouse events
            let mouseDown = false;
            this.view.addEventListener("mousedown", (event) => {
                mouseDown = true;
                this.mapAndUpdateTouches([event] as any as TouchList);
            });
            this.view.addEventListener("mousemove", (event) => {
                if (mouseDown) this.mapAndUpdateTouches([event] as any as TouchList);
            });
            this.view.addEventListener("mouseup", (event) => {
                mouseDown = false;
                this.mapAndUpdateTouches([] as any as TouchList);
            });
        }

        this.resize(window.innerWidth, window.innerHeight);
    }

    get visible(): boolean {
        return this.#visible;
    }

    set visible(visible: boolean) {
        if (visible === this.#visible) return;
        this.#visible = visible;
        if (this.view) {
            this.view.style.display = visible ? "block" : "none";
        }
        if (visible) this.setNeedsRerender();
    }

    setResolution(resolution: number) {
        if (this.renderer) {
            this.renderer.resolution = resolution;
        }

        this.setNeedsRerender();
        this.render();
    }

    resize(width: number, height: number): void {
        this.controls.resize(width, height);
        this.renderer?.resize(window.innerWidth, window.innerHeight);
        this.setNeedsRerender();
        this.render();
    }

    render() {
        if (!this.#needsRerender) return;
        if (this.controls.stage.destroyed) return;
        this.#needsRerender = false;
        this.renderer?.render(this.controls.stage);
    }

    destroy(): void {
        this.controls.destroy();
        this.renderer?.destroy(true);
        window.removeEventListener("resize", this.onWindowResizeListener);
    }

    setNeedsRerender() {
        this.#needsRerender = true;
    }
}
