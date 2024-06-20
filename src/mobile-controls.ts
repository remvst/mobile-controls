import * as PIXI from "pixi.js";
import { Control } from "./control";
import { Touch } from "./touch";

export abstract class MobileControls {
    width: number = 0;
    height: number = 0;

    readonly stage = new PIXI.Container();

    private readonly claimMap = new Map<number, Control>();

    readonly controls: Control[] = [];

    private readonly previousTouchIdentifiers = new Set<number>();

    abstract updateLayout(width: number, height: number): void;

    abstract setup(): void;

    destroy() {
        this.stage.destroy({
            children: true,
            baseTexture: false,
            texture: false,
        });
    }

    add<ControlType extends Control>(control: ControlType): ControlType {
        this.controls.push(control);
        this.stage.addChild(control.view);
        control.update([], this.previousTouchIdentifiers);

        return control;
    }

    addControl<ControlType extends Control>(control: ControlType): ControlType {
        return this.add(control);
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.updateLayout(width, height);
    }

    updateTouches(touches: Touch[]) {
        if (this.stage.destroyed) return;

        const seenIdentifiers = new Set<number>();
        for (const touch of touches) {
            touch.claimedBy = this.claimMap.get(touch.identifier) || null;
            seenIdentifiers.add(touch.identifier);
        }

        for (const control of this.controls) {
            control.update(touches, this.previousTouchIdentifiers);

            // In case this specific control caused destroy() to be called, make sure we stop
            if (this.stage.destroyed) break;
        }

        for (const touch of touches) {
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
        for (const touch of touches) {
            this.previousTouchIdentifiers.add(touch.identifier);
        }
    }
}
