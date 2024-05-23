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

export function radialLayout(
    controls: Control[],
    center: Vector2Like,
    radius: number,
    startAngle: number = 0,
) {
    controls.forEach((button, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2 + startAngle;

        button.view.position.set(
            center.x + Math.cos(angle) * radius,
            center.y + Math.sin(angle) * radius,
        );
    });
}
