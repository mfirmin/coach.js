import THREE from '../lib/three.min';

class Camera {
    init(opts = {}) {
        this._type = (opts.type === undefined) ? 'perspective' : opts.type;
        this._target = (opts.target === undefined) ? [0, 0, 0] : opts.type;
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
        this.setPosition(pos);

        const target = (opts.target === undefined) ? [0, 0, 0] : opts.target;
        this.setTarget(target);
    }

    setPerspective(opts) {
        this._type = 'perspective';

        this.threeCamera = new THREE.PerspectiveCamera(
            (opts.fov === undefined) ? 45 : opts.fov,
            (opts.aspect === undefined) ? 1 : opts.aspect,
            (opts.near === undefined) ? 1 : opts.near,
            (opts.far === undefined) ? 2000 : opts.far,
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
