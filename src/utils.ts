import { Vector2 } from "@remvst/geometry";
import { MobileControls } from "./mobile-controls";
import { Touch } from "./touch";

export function addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
) {
    element.addEventListener(type, listener, options);
    return () => element.removeEventListener(type, listener);
}

export function mapAndUpdateTouches(
    element: HTMLElement,
    controls: MobileControls,
    touches: TouchList,
) {
    if (!element) return;
    if (controls.stage.destroyed) return;

    const rect = element.getBoundingClientRect();

    const mapped: Touch[] = [];

    for (const touch of touches) {
        const relativeX = (touch.pageX - rect.left) / (rect.right - rect.left);
        const relativeY = (touch.pageY - rect.top) / (rect.bottom - rect.top);

        mapped.push({
            identifier: touch.identifier,
            position: new Vector2(
                relativeX * controls.width,
                relativeY * controls.height,
            ),
            claimedBy: null,
        });
    }

    controls.updateTouches(mapped);
}
