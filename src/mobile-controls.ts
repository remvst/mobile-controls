import { Vector2 } from '@remvst/geometry';
import * as PIXI from 'pixi.js';
import { Control } from './control';
import { Touch } from './touch';

export abstract class MobileControls {

    readonly view: HTMLCanvasElement;
    private readonly stage = new PIXI.Container();

    private needsRerender = true;
    private visible = true;
    private readonly claimMap = new Map<number, Control>();

    readonly controls: Control[] = [];

    private readonly renderer: PIXI.IRenderer<HTMLCanvasElement>;

    constructor() {
        this.renderer = PIXI.autoDetectRenderer<HTMLCanvasElement>({
            'width': 1,
            'height': 1,
            'resolution': 1,
            'antialias': true,
            'backgroundAlpha': 0,
            'clearBeforeRender': true,
        });

        this.view = this.renderer.view;

        this.view.style.position = 'absolute';
        this.view.style.zIndex = '99';
        this.view.style.left = this.view.style.right = this.view.style.top = this.view.style.bottom = '0px';
        this.resize();

        window.addEventListener('resize', () => this.resize());

        this.view.addEventListener('contextmenu', (event) => event.preventDefault());
        this.view.addEventListener('touchstart', (event) => this.updateTouches(event));
        this.view.addEventListener('touchmove', (event) => this.updateTouches(event))
        this.view.addEventListener('touchend', (event) => this.updateTouches(event));
        this.view.addEventListener('touchcancel', (event) => this.updateTouches(event));
    }

    abstract updateLayout(): void;

    destroy() {
        this.stage.destroy({
            'children': true,
            'baseTexture': true,
            'texture': true,
        });
        this.renderer.destroy(true);
    }

    addControl(control: Control) {
        this.controls.push(control);
        this.stage.addChild(control.view);
        control.update([]);
    }

    get width() { return window.innerWidth; }
    get height() { return window.innerHeight; }

    resize() {
        this.renderer.resize(window.innerWidth, window.innerHeight);
        this.updateLayout();

        this.needsRerender = true;
        this.render();
    }

    private updateTouches(event: TouchEvent) {
        event.preventDefault();
        event.stopPropagation();

        const rect = this.view.getBoundingClientRect();

        const mapped: Touch[] = [];
        const seenIdentifiers = new Set<number>();

        for (const touch of event.touches) {
            const relativeX = (touch.pageX - rect.left) / (rect.right - rect.left);
            const relativeY = (touch.pageY - rect.top) / (rect.bottom - rect.top);

            mapped.push({
                'identifier': touch.identifier,
                'position': new Vector2(
                    relativeX * this.width,
                    relativeY * this.height,
                ),
                'claimedBy': this.claimMap.get(touch.identifier) || null,
            });

            seenIdentifiers.add(touch.identifier);
        }

        for (const control of this.controls) {
            control.update(mapped);
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

        this.needsRerender = true;
    }

    render() {
        if (!this.needsRerender) return;
        this.needsRerender = false;
        this.renderer.render(this.stage);
    }

    setVisible(visible: boolean) {
        if (visible === this.visible) return;
        this.visible = visible;
        this.view.style.display = visible ? 'block' : 'none';
        if (visible) this.needsRerender = true;
    }
}
