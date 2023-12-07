import { Joystick } from './../../src/joystick';
import UpIcon from '../assets/up.png';
import { MobileControls } from '@remvst/mobile-controls';

class MyControls extends MobileControls {

    readonly joystick = new Joystick();

    constructor() {
        super();

        this.addControl(this.joystick);
    }

    updateLayout() {

    }
}

window.addEventListener('load', () => {
    // TODO
    console.log(UpIcon);

    const controls = new MyControls();
    document.body.appendChild(controls.view);
});
