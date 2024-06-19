import { Vector2Like } from "@remvst/geometry";
import { DisplayObject } from "pixi.js";
import { Touch } from "./touch";
import { EventEmitter } from "./event-emitter";

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
    readonly onChange: EventEmitter<void>;
}
