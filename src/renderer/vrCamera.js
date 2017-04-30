import { VRControls } from '../lib/index';
import Camera from './camera';

class VRCamera extends Camera {
    constructor(opts = {}) {
        super(opts);

        this.vrControls = new VRControls(this.threeCamera);
        this.vrControls.standing = true;
        this.positionY = this.vrControls.userHeight;
    }


    initialize(opts = {}) {
        super.initialize(opts);
    }
}

export default VRCamera;
