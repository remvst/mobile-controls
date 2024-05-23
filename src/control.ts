import { Vector2Like } from "@remvst/geometry";
import { DisplayObject } from "pixi.js";
import { Touch } from "./touch";

export interface Control {
    enabled: boolean;
    readonly position: Vector2Like;
    readonly view: DisplayObject;
    update(touches: Touch[], previousTouchIdentifiers: Set<number>): void;
    touchIdentifier: number | null;
    onChange(listener: (control: ThisType<this>) => void): void;
}
