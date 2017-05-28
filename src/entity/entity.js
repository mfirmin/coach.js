class Entity {
    constructor(opts = {}) {
        this.id = (opts.id) === undefined ? Entity.newID() : opts.id;

        this._position = (opts.position === undefined) ?
            [0, 0, 0] : opts.position;
        this._orientation = (opts.orientation === undefined) ?
            [1, 0, 0, 0] : opts.orientation; // q.w, q.v
        this._angularVelocity = (opts.angularVelocity === undefined) ?
            [0, 0, 0] : opts.angularVelocity;

        this._mass = (opts.mass === undefined) ? 0 : opts.mass;
        this._color = (opts.color === undefined) ? [130, 130, 130] : opts.color;

        this._highlighted = false;

        // Reference to the character this entity belongs to.
        this._character = (opts.character === undefined) ? null : opts.character;

        this._world = null;

        this._dynamic = (opts.dynamic === undefined) ? true : opts.dynamic;

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

    get color() {
        return this._color;
    }

    set color(c) {
        this._color[0] = c[0];
        this._color[1] = c[1];
        this._color[2] = c[2];
    }

    set highlighted(h) {
        this._highlighted = h;
    }

    get highlighted() {
        return this._highlighted;
    }

    get character() {
        return this._character;
    }

    set character(c) {
        this._character = c;
        if (this._world !== null) {
            this._world.updateEntity(this.id);
        }
    }

    get dynamic() {
        return this._dynamic;
    }

    set dynamic(d) {
        if (this._dynamic === d) {
            return;
        }
        this._dynamic = d;
        this._world.toggleDynamic(this.id);
    }

    get world() {
        return this._world;
    }

    set world(w) {
        this._world = w;
    }

    static newID() {
        return Entity._idCount++;
    }
}

Entity._idCount = 0;

export default Entity;
