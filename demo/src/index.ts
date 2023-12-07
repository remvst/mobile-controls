import { Texture } from 'pixi.js';
import { Sprite } from 'pixi.js';
import UpIcon from '../assets/up.png';
import { MobileControls, Joystick, Button } from '@remvst/mobile-controls';

class MyControls extends MobileControls {

    readonly joystick = new Joystick();
    readonly button = new Button(Texture.from(UpIcon));

    addControls() {
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
    }
}

window.addEventListener('load', async () => {
    const upTexture = Texture.from(UpIcon);
    await upTexture.baseTexture.resource.load();

    const controls = new MyControls();
    controls.setup();
    document.body.appendChild(controls.view);

    const render = () => {
        controls.render();
        requestAnimationFrame(render);
    };
    render();
});
