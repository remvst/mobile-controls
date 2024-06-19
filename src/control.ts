import { Vector2Like } from "@remvst/geometry";
import { DisplayObject } from "pixi.js";
import { Touch } from "./touch";

export interface Control {
    // State
    enabled: boolean;

    // Layout
    readonly position: Vector2Like;
    readonly width: number;
    readonly height: number;

    // Rendering
    readonly view: DisplayObject;

    // Touch handling
    update(touches: Touch[], previousTouchIdentifiers: Set<number>): void;
    touchIdentifier: number | null;

    // Listeners
    onChange(listener: () => void): void;
}
