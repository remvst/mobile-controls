import { Vector2Like } from "@remvst/geometry";
import { Control } from "./control";

export function linearLayout(
    controls: Control[],
    startPosition: Vector2Like,
    stepX: number,
    stepY: number,
) {
    let { x, y } = startPosition;

    for (const control of controls) {
        control.position.x = x;
        control.position.y = y;

        x += stepX;
        y += stepY;
    }
}
