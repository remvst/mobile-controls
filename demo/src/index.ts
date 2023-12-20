import { Texture } from 'pixi.js';
import UpIcon from '../assets/up.png';
import { MobileControls, Joystick, Button } from '@remvst/mobile-controls';
import { Rectangle } from '@remvst/geometry';

class MyControls extends MobileControls {

    readonly joystick = new Joystick();
    readonly button = new Button(Texture.from(UpIcon));

    addControls() {
        this.button.touchArea = new Rectangle();

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

        // Extend the button's touch area
        this.button.touchArea?.centerAround(
            this.button.view.position.x,
            this.button.view.position.y,
            this.button.radius * 3,
            this.button.radius * 3,
        );
    }
}

window.addEventListener('load', async () => {
    const upTexture = Texture.from(UpIcon);
    await upTexture.baseTexture.resource.load();

    const controls = new MyControls(true);
    controls.setup();
    document.body.appendChild(controls.view);

    const render = () => {
        controls.render();
        requestAnimationFrame(render);
    };
    render();
});
