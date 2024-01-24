import { Rectangle } from "@remvst/geometry";
import { Button, Joystick, MobileControls } from "@remvst/mobile-controls";
import { Texture } from "pixi.js";
import FireIcon from "../assets/fire.png";
import UpIcon from "../assets/up.png";

class MyControls extends MobileControls {
    readonly joystick = new Joystick();
    readonly button = new Button(Texture.from(UpIcon));
    readonly fireButton = new Button(Texture.from(FireIcon));

    addControls() {
        this.button.touchArea = new Rectangle();

        this.addControl(this.joystick);
        this.addControl(this.button);
        this.addControl(this.fireButton);
    }

    updateLayout(width: number, height: number) {
        this.joystick.view.position.set(
            this.joystick.radius + 20,
            height - this.joystick.radius - 20,
        );
        this.button.view.position.set(
            width - this.button.radius - 20,
            height - this.button.radius - 20,
        );
        this.fireButton.view.position.set(
            this.button.view.position.x -
                this.button.radius -
                this.fireButton.radius -
                20,
            this.button.view.position.y,
        );

        // Extend the button's touch area
        this.button.touchArea?.centerAround(
            this.button.view.position.x,
            this.button.view.position.y,
            this.button.radius * 3,
            this.button.radius * 3,
        );
    }
}

window.addEventListener("load", async () => {
    const upTexture = Texture.from(UpIcon);
    await upTexture.baseTexture.resource.load();

    const controls = new MyControls(true);
    controls.setup();
    document.body.appendChild(controls.view);

    controls.button.retainsTouches = false;
    controls.button.onClick = () => console.log("jump!");

    controls.fireButton.onClick = () => console.log("fire!");

    const render = () => {
        controls.render();
        requestAnimationFrame(render);
    };
    render();
});
