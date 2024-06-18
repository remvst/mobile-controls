import { Vector2, distance } from "@remvst/geometry";
import * as PIXI from "pixi.js";
import { Button } from "./button";
import { MobileControls } from "./mobile-controls";
import { Touch } from "./touch";

export abstract class StandaloneMobileControls extends MobileControls {
    readonly view: HTMLCanvasElement;
    private readonly renderer: PIXI.IRenderer<HTMLCanvasElement>;

    private readonly onWindowResizeListener = () =>
        this.resize(window.innerWidth, window.innerHeight);

    constructor(includeMouseEvents: boolean = false) {
        super();

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
            this.hoveringControl = null;

            const position = { x: event.pageX, y: event.pageY };
            for (const control of this.controls) {
                if (
                    control.enabled &&
                    control instanceof Button &&
                    distance(control.view.position, position) < control.radius
                ) {
                    this.hoveringControl = control;
                    break;
                }
            }

            this.view.style.cursor = this.hoveringControl
                ? "pointer"
                : "inherit";
        });

        if (includeMouseEvents) {
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
    }

    private onTouchEvent(event: TouchEvent) {
        if (this.stage.destroyed) return;
        event.preventDefault();
        event.stopPropagation();

        this.mapAndUpdateTouches(event.touches);
    }

    private mapAndUpdateTouches(touches: TouchList) {
        if (this.stage.destroyed) return;

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
                    relativeX * this.width,
                    relativeY * this.height,
                ),
                claimedBy: null,
            });
        }

        this.updateTouches(mapped);
    }

    setup(): void {
        super.setup();
        this.resize(window.innerWidth, window.innerHeight);
    }

    setVisible(visible: boolean) {
        if (visible === this.visible) return;
        this.visible = visible;
        this.view.style.display = visible ? "block" : "none";
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
        super.resize(width, height);
        this.renderer.resize(window.innerWidth, window.innerHeight);
        this.setNeedsRerender();
        this.render();
    }

    render() {
        if (!this.needsRerender) return;
        if (this.stage.destroyed) return;
        this.needsRerender = false;
        this.renderer?.render(this.stage);
    }

    destroy(): void {
        super.destroy();

        this.renderer?.destroy(true);
        window.removeEventListener("resize", this.onWindowResizeListener);
    }
}
