import * as PIXI from "pixi.js";
import { MobileControls } from "./mobile-controls";
import { MobileControlsMouseHandler } from "./mobile-controls-mouse-handler";
import { MobileControlsTouchHandler } from "./mobile-controls-touch-handler";

export class StandaloneMobileControlsRenderer {
    #visible = true;
    #needsRerender = true;
    #resolution = 1;

    view?: HTMLCanvasElement;
    private renderer?: PIXI.IRenderer<HTMLCanvasElement>;

    touchHandler?: MobileControlsTouchHandler;
    mouseHandler?: MobileControlsMouseHandler;

    private readonly onWindowResizeListener = () =>
        this.resize(window.innerWidth, window.innerHeight);

    constructor(
        readonly controls: MobileControls,
        readonly includeMouseEvents: boolean = false,
    ) {}

    setup(): void {
        for (const control of this.controls.controls) {
            control.onChange(() => this.setNeedsRerender());
        }

        this.renderer = PIXI.autoDetectRenderer<HTMLCanvasElement>({
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: this.#resolution,
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

        this.touchHandler = new MobileControlsTouchHandler(
            this.controls,
            this.view,
        );
        this.touchHandler?.setup();

        this.mouseHandler = new MobileControlsMouseHandler(
            this.controls,
            this.view,
        );
        this.mouseHandler?.setup();

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
        this.#resolution = resolution;

        if (this.renderer) {
            this.renderer.resolution = resolution;
        }

        this.setNeedsRerender();
        this.render();
    }

    resize(width: number, height: number): void {
        this.controls.resize(width, height);
        this.renderer?.resize(width, height);
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
        this.touchHandler?.destroy();
        this.mouseHandler?.destroy();
        this.controls.destroy();
        this.renderer?.destroy(true);
        window.removeEventListener("resize", this.onWindowResizeListener);
    }

    setNeedsRerender() {
        this.#needsRerender = true;
    }
}
