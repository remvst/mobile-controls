import { Rectangle } from "@remvst/geometry";
import {
    Button,
    DynamicJoystick,
    MobileControls,
    StandaloneMobileControlsRenderer,
    linearLayout,
    radialLayout,
} from "@remvst/mobile-controls";
import { Texture } from "pixi.js";
import "pixi.js-legacy";
import FireIcon from "../assets/fire.png";
import UpIcon from "../assets/up.png";

class MyControls extends MobileControls {
    readonly joystick = this.add(new DynamicJoystick());
    readonly button = this.add(new Button(Texture.from(UpIcon)));
    readonly fireButton = this.add(new Button(Texture.from(FireIcon)));

    readonly jumpButton = this.add(new Button(Texture.from(UpIcon)));
    readonly attackButton = this.add(new Button(Texture.from(UpIcon)));
    readonly dashButton = this.add(new Button(Texture.from(UpIcon)));
    readonly interactButton = this.add(new Button(Texture.from(UpIcon)));

    setup() {
        this.button.touchArea = new Rectangle();
        super.setup();
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
            [
                this.jumpButton,
                this.attackButton,
                this.dashButton,
                this.interactButton,
            ],
            { x: width - 100, y: height - 100 },
            this.jumpButton.radius + 20,
            Math.PI / 2,
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

    const controls = new MyControls();
    controls.setup();

    const controlsRenderer = new StandaloneMobileControlsRenderer(
        controls,
        true,
    );
    controlsRenderer.setResolution(window.devicePixelRatio);
    controlsRenderer.setup();
    document.body.appendChild(controlsRenderer.view!);

    controls.button.retainsTouches = false;
    controls.button.onClick.listen(() => console.log("pause!"));

    controls.jumpButton.onClick.listen(() => console.log("jump!"));

    controls.fireButton.onClick.listen(() => {
        controlsRenderer.destroy();
        controls.destroy();
    });

    controlsRenderer.visible = true;

    const render = () => {
        controlsRenderer.render();
        requestAnimationFrame(render);
    };
    render();
});
