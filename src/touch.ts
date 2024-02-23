import { Vector2Like } from "@remvst/geometry";
import { Control } from "./control";

export interface Touch {
    identifier: number;
    position: Vector2Like;
    claimedBy: Control | null;
}
