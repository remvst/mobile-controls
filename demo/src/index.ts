import { Rectangle } from "@remvst/geometry";
import {
    Button,
    DynamicJoystick,
    MobileControls,
    linearLayout,
    radialLayout,
} from "@remvst/mobile-controls";
import { Texture } from "pixi.js";
import "pixi.js-legacy";
import FireIcon from "../assets/fire.png";
import UpIcon from "../assets/up.png";

class MyControls extends MobileControls {
    readonly joystick = new DynamicJoystick();
    readonly button = new Button(Texture.from(UpIcon));
    readonly fireButton = new Button(Texture.from(FireIcon));

    readonly jumpButton = new Button(Texture.from(UpIcon));
    readonly attackButton = new Button(Texture.from(UpIcon));
    readonly dashButton = new Button(Texture.from(UpIcon));
    readonly interactButton = new Button(Texture.from(UpIcon));

    addControls() {
        this.button.touchArea = new Rectangle();

        this.addControl(this.fireButton);
        this.addControl(this.joystick);
        this.addControl(this.button);

        this.addControl(this.jumpButton);
        this.addControl(this.attackButton);
        this.addControl(this.dashButton);
        this.addControl(this.interactButton);
    }

    updateLayout(width: number, height: number) {
        this.joystick.position.x = this.joystick.radius + 20;
        this.joystick.position.y = height - this.joystick.radius - 20;

        linearLayout(
            [this.button, this.fireButton],
            { x: width - this.button.radius - 20, y: this.button.radius + 20 },
            -(this.button.width + 20),
            0,
        );

        radialLayout(
            [this.jumpButton, this.attackButton, this.dashButton, this.interactButton],
            { x: width - 100, y: height - 100 },
            this.jumpButton.radius + 20,
            0,
        );

        this.joystick.claimArea.update(
            0,
            height / 2,
            this.fireButton.position.x - 100,
            height / 2,
        );

        // Extend the button's touch area
        this.button.touchArea?.centerAround(
            this.button.position.x,
            this.button.position.y,
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
