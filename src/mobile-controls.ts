import { Vector2, distance } from "@remvst/geometry";
import * as PIXI from "pixi.js";
import { Button } from "./button";
import { Control } from "./control";
import { Touch } from "./touch";

export abstract class MobileControls {
    readonly view: HTMLCanvasElement;
    private readonly stage = new PIXI.Container();

    private needsRerender = true;
    private visible = true;
    private readonly claimMap = new Map<number, Control>();

    readonly controls: Control[] = [];
    hoveringControl: Control | null = null;

    private readonly previousTouchIdentifiers = new Set<number>();

    private readonly renderer: PIXI.IRenderer<HTMLCanvasElement>;

    private readonly onWindowResizeListener = () => this.resize();

    constructor(includeMouseEvents: boolean = false) {
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

            this.view.style.cursor = this.hoveringControl ? "pointer" : "inherit";
        });

        if (includeMouseEvents) {
            // Fake touches based on mouse events
            let mouseDown = false;
            this.view.addEventListener("mousedown", (event) => {
                mouseDown = true;
                this.updateTouches([event] as any as TouchList);
            });
            this.view.addEventListener("mousemove", (event) => {
                if (mouseDown) this.updateTouches([event] as any as TouchList);
            });
            this.view.addEventListener("mouseup", (event) => {
                mouseDown = false;
                this.updateTouches([] as any as TouchList);
            });
        }
    }

    abstract addControls(): void;
    abstract updateLayout(width: number, height: number): void;

    setup() {
        this.addControls();
        this.resize();
    }

    destroy() {
        this.stage.destroy({
            children: true,
            baseTexture: false,
            texture: false,
        });
        this.renderer.destroy(true);

        window.removeEventListener("resize", this.onWindowResizeListener);
    }

    addControl(control: Control) {
        this.controls.push(control);
        this.stage.addChild(control.view);
        control.update([], this.previousTouchIdentifiers);

        for (const control of this.controls) {
            control.onChange(() => (this.needsRerender = true));
        }

        this.needsRerender = true;
    }

    get width() {
        return window.innerWidth;
    }
    get height() {
        return window.innerHeight;
    }

    setResolution(resolution: number) {
        this.renderer.resolution = resolution;
        this.resize();
    }

    resize() {
        this.renderer.resize(window.innerWidth, window.innerHeight);
        this.updateLayout(window.innerWidth, window.innerHeight);

        this.setNeedsRerender();
        this.render();
    }

    private onTouchEvent(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.updateTouches(event.touches);
    }

    private updateTouches(touches: TouchList) {
        if (this.stage.destroyed) return;

        const rect = this.view.getBoundingClientRect();

        const mapped: Touch[] = [];
        const seenIdentifiers = new Set<number>();

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
                claimedBy: this.claimMap.get(touch.identifier) || null,
            });

            seenIdentifiers.add(touch.identifier);
        }

        for (const control of this.controls) {
            control.update(mapped, this.previousTouchIdentifiers);

            // In case this specific control caused destroy() to be called, make sure we stop
            if (this.stage.destroyed) break;
        }

        for (const touch of mapped) {
            if (touch.claimedBy) {
                this.claimMap.set(touch.identifier, touch.claimedBy);
            }
        }

        for (const identifier of this.claimMap.keys()) {
            if (!seenIdentifiers.has(identifier)) {
                this.claimMap.delete(identifier);
            }
        }

        this.previousTouchIdentifiers.clear();
        for (const touch of mapped) {
            this.previousTouchIdentifiers.add(touch.identifier);
        }
    }

    render() {
        if (!this.needsRerender) return;
        if (this.stage.destroyed) return;
        this.needsRerender = false;
        this.renderer.render(this.stage);
    }

    setVisible(visible: boolean) {
        if (visible === this.visible) return;
        this.visible = visible;
        this.view.style.display = visible ? "block" : "none";
        if (visible) this.setNeedsRerender();
    }

    setNeedsRerender() {
        this.needsRerender = true;
    }
}
