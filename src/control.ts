import { DisplayObject } from "pixi.js";
import { Touch } from "./touch";

export interface Control {
    enabled: boolean;
    readonly view: DisplayObject;
    update(touches: Touch[], previousTouchIdentifiers: Set<number>): void;
    touchIdentifier: number | null;
    onChange(listener: (control: ThisType<this>) => void): void;
}
