import { Rectangle } from "@remvst/geometry";
import {
    Button,
    DynamicJoystick,
    MobileControls,
} from "@remvst/mobile-controls";
import { Texture } from "pixi.js";
import "pixi.js-legacy";
import FireIcon from "../assets/fire.png";
import UpIcon from "../assets/up.png";

class MyControls extends MobileControls {
    readonly joystick = new DynamicJoystick();
    readonly button = new Button(Texture.from(UpIcon));
    readonly fireButton = new Button(Texture.from(FireIcon));

    addControls() {
        this.button.touchArea = new Rectangle();

        this.addControl(this.fireButton);
        this.addControl(this.joystick);
        this.addControl(this.button);
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

        this.joystick.claimArea.update(
            0,
            height / 2,
            this.fireButton.view.position.x - 100,
            height / 2,
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
    controls.setResolution(window.devicePixelRatio);
    controls.setup();
    document.body.appendChild(controls.view);

    controls.button.retainsTouches = false;
    controls.button.onClick = () => console.log("jump!");

    controls.fireButton.onClick = () => controls.destroy();

    const render = () => {
        controls.render();
        requestAnimationFrame(render);
    };
    render();
});
