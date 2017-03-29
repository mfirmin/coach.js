import Joint from './joint';

class Hinge extends Joint {
    constructor(name, parent, child, pos, axis, opts = {}) {
        super(name, parent, child);

        this._position = pos;
        this._axis = axis;

        this._angle = (opts.angle === undefined) ? 0 : opts.angle;
        this._angularVelocity = (opts.angularVelocity === undefined) ? 0 : opts.angularVelocity;
        this._angularVelocityPrev = this.angularVelocity;
        this._torque = [0, 0, 0];

        const limits = (opts.limits === undefined) ? {} : opts.limits;

        this._lo = limits.lo;
        this._hi = limits.hi;

        this._torqueLimit = (opts.torqueLimit === undefined) ? 370 : opts.torqueLimit;

        this._type = 'HINGE';
    }

    initialize() {
        super.initialize();
    }

    resetTorque() {
        this.torque = [0, 0, 0];
    }

    updateAngle(ang, dt) {
        const angleLast = this.angle;
        this._angle = ang;
        if (dt !== undefined) {
            this._angularVelocityPrev = this._angularVelocity;
            this._angularVelocity = (this._angle - angleLast) / dt;
        }
    }


    get axis() {
        return this._axis;
    }

    set axis(a) {
        this._axis = a;
    }

    get angle() {
        return this._angle;
    }

    /**
     * set angle
     * @description
     * Directly sets the angle
     * NOTE - Do not use this during simulation, as it will not update the angular velocity properly
     *
     */
    set angle(ang) {
        this._angle = ang;
    }

    get position() {
        return this._position;
    }

    set position(xyz) {
        this._position[0] = xyz[0];
        this._position[1] = xyz[1];
        this._position[2] = xyz[2];
    }

    get angularVelocity() {
    //    // average angVel over 2 timesteps.
    //    return (this.angularVelocityPrev + this.angularVelocity)/2.;
    //    return 0;
        return this._angularVelocity;
    }

    set angularVelocity(angVel) {
        this._angularVelocity = angVel;
    }

    set torque(t) {
        this._torque[0] = t[0];
        this._torque[1] = t[1];
        this._torque[2] = t[2];
    }

    get torque() {
        return this._torque;
    }

    // TODO: Make this not 2D...
    addTorque(t) {
        this._torque[2] += t;
    }

    getLimitedTorque() {
        const ret = [this._torque[0], this._torque[1], this._torque[2]];
        if (Math.abs(ret[2]) > this.torqueLimit) {
            ret[2] = (this._torqueLimit * ret[2]) / Math.abs(ret[2]);
        }

        return ret;
    }

    get type() {
        return this._type;
    }
}

export default Hinge;
