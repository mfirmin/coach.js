/* global window */
import { three as THREE, OrbitControls } from '../lib/index';
import $ from '../lib/jquery-2.1.4.min';

class Camera {
    constructor(opts = {}) {
        this._type = (opts.type === undefined) ? 'perspective' : opts.type;
        this._target = (opts.target === undefined) ? [0, 0, 0] : opts.target;
        this._aspectRatio = (opts.aspect === undefined) ? 1 : opts.apect;

        this.initialize(opts);
    }


    initialize(opts = {}) {
        if (this._type === 'perspective') {
            this.setPerspective(opts);
        } else {
            this.setOrthographic(opts);
        }

        const pos = (opts.position === undefined) ? [0, 0, 5] : opts.position;
        this.position = pos;

        const target = (opts.target === undefined) ? [0, 0, 0] : opts.target;
        this.target = target;

        this.initControls();
    }

    setPerspective(opts) {
        this._type = 'perspective';

        this.threeCamera = new THREE.PerspectiveCamera(
            (opts.fov === undefined) ? 75 : opts.fov,
            (opts.aspect === undefined) ? window.innerWidth / window.innerHeight : opts.aspect,
            (opts.near === undefined) ? 0.1 : opts.near,
            (opts.far === undefined) ? 10000 : opts.far,
        );

        return this.threeCamera;
    }

    setOrthographic(opts) {
        this._type = 'orthographic';

        this.threeCamera = new THREE.OrthographicCamera(
            (opts.left === undefined) ? -2 : opts.left,
            (opts.right === undefined) ? 2 : opts.right,
            (opts.top === undefined) ? 2 : opts.top,
            (opts.bottom === undefined) ? -2 : opts.bottom,
            (opts.near === undefined) ? 1 : opts.near,
            (opts.far === undefined) ? 2000 : opts.far,
        );

        return this.threeCamera;
    }

    initControls() {
        const controls = new OrbitControls(this.threeCamera, $('body')[0]);

        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 1.2;

        this.controls = controls;
    }

    set aspectRatio(aspect) {
        this._aspect = aspect;
        if (this.type === 'perspective') {
            this.threeCamera.aspect = aspect;
        }
        this.threeCamera.updateProjectionMatrix();
    }

    get position() {
        return [
            this.threeCamera.position.x,
            this.threeCamera.position.y,
            this.threeCamera.position.z,
        ];
    }

    set position(pos) {
        this.threeCamera.position.x = pos[0];
        this.threeCamera.position.y = pos[1];
        this.threeCamera.position.z = pos[2];
    }

    set positionX(x) {
        this.threeCamera.position.x = x;
    }

    set positionY(y) {
        this.threeCamera.position.y = y;
    }

    set positionZ(z) {
        this.threeCamera.position.z = z;
    }

    get target() {
        return this._target;
    }

    set target(target) {
        this._target[0] = target[0];
        this._target[1] = target[1];
        this._target[2] = target[2];

        this.threeCamera.lookAt(new THREE.Vector3(target[0], target[1], target[2]));
    }

    get type() {
        return this._type;
    }

    set type(t) {
        this._type = t;
    }
}

export default Camera;
