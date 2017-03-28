class Entity {
    constructor(name, opts = {}) {
        this.name = name;

        this._position = (opts.position === undefined) ?
            [0, 0, 0] : opts.position;
        this._orientation = (opts.position === undefined) ?
            [0, 0, 0, 1] : opts.orientation; // q.w, q.v
        this._angularVelocity = (opts.angularVelocity === undefined) ?
            [0, 0, 0] : opts.angularVelocity;

        this._mass = (opts.mass === undefined) ? 0 : opts.mass;
        this._color = (opts.color === undefined) ? [130, 130, 130] : opts.color;

        this.initialize();
    }

    // eslint-disable-next-line class-methods-use-this
    initialize() { }

    set position(xyz) {
        this._position[0] = xyz[0];
        this._position[1] = xyz[1];
        this._position[2] = xyz[2];
    }

    set orientation(q) {
        this._orientation[0] = q[0];
        this._orientation[1] = q[1];
        this._orientation[2] = q[2];
        this._orientation[3] = q[3];
    }

    set angularVelocity(a) {
        // Angular Velocity expressed in WORLD COORDINATES!

        this._angularVelocity[0] = a[0];
        this._angularVelocity[1] = a[1];
        this._angularVelocity[2] = a[2];

        // DO NOT INCLUDE THIS LINE 7 FEB 2016
        // this.angularVelocity = utils.rotateVector(
        //     this.angularVelocity,
        //     utils.RFromQuaternion(this.orientation),
        // );
    }

    get position() {
        return this._position;
    }
    get orientation() {
        return this._orientation;
    }

    get angularVelocity() {
        return this._angularVelocity;
    }

    get mass() {
        return this._mass;
    }

}

export default Entity;
