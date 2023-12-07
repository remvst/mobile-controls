import { DisplayObject } from "pixi.js";
import { Touch } from "./touch";

export interface Control {
    enabled: boolean;
    readonly view: DisplayObject;
    update(touches: Touch[]): void;
    touchIdentifier: number | null;
}
