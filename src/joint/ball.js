import Joint from './joint';
import utils from '../utils/utils';

class Ball extends Joint {
    constructor(name, parent, child, pos, opts = {}) {
        super(name, parent, child);

        this._position = pos;

        this._angleLast = [1, 0, 0, 0];
        this._angle = [1, 0, 0, 0];

        this._angularVelocity = [0, 0, 0];
        this._angularVelocityPrev = [
            this._angularVelocity[0],
            this._angularVelocity[1],
            this._angularVelocity[2],
        ];

        this._torque = [0, 0, 0];

        this._limits = (opts.limits === undefined) ? {} : opts.limits;
        this._torqueScale = (opts.torqueScale === undefined) ? [1, 1, 1] : opts.torqueScale;
        this._torqueLimit = (opts.torqueLimit === undefined) ? 10000 : opts.torqueLimit;

        this._type = 'BALL';
    }

    initialize() {
        super.initialize();
    }

    // Calculates joint's orientation in terms of Parent coordinates
    // (ie, quaternion to rotate parent to child.)
    calculateOrientation() {
        const pOrientation = this.parent.getOrientation();
        const cOrientation = this.child.getOrientation();

        this._angle = utils.multiplyQuaternions(
            utils.getQuaternionInverse(pOrientation),
            cOrientation,
        );
    }

    // Calculates joint's angular velocity in Parent coordinate frame
    calculateAngularVelocity() {
        const pAngVel = this.parent.getAngularVelocity();
        const cAngVel = this.child.getAngularVelocity();

        const wRel = [cAngVel[0] - pAngVel[0], cAngVel[1] - pAngVel[1], cAngVel[2] - pAngVel[2]];

        // angVel is in world coords, rotate it by parent's orientation to get parent coords
        this._angularVelocity = utils.rotateVector(
            wRel,
            utils.RFromQuaternion(utils.getQuaternionInverse(this.parent.getOrientation())),
        );
    //    this._angularVelocity = wRel;
    }

    updateAngle(angs, dt) {
        this._angle = angs;
    }


    getLimitedTorque() {
        // get the torque in child coordinates...
        const qToChild = this.getAngle();
        const qInverse = [qToChild[0], -qToChild[1], -qToChild[2], -qToChild[3]];
        let cTorque = utils.rotateVector(this._torque, utils.RFromQuaternion(qInverse));

        cTorque = [
            cTorque[0] * this._torqueScale[0],
            cTorque[1] * this._torqueScale[1],
            cTorque[2] * this._torqueScale[2],
        ];

        if (cTorque[0] > this._torqueLimit * this._torqueScale[0]) {
            cTorque[0] = this._torqueLimit * this._torqueScale[0];
        }
        if (cTorque[1] > this._torqueLimit * this._torqueScale[1]) {
            cTorque[1] = this._torqueLimit * this._torqueScale[1];
        }
        if (cTorque[2] > this._torqueLimit * this._torqueScale[2]) {
            cTorque[2] = this._torqueLimit * this._torqueScale[2];
        }

        if (cTorque[0] < -this._torqueLimit * this._torqueScale[0]) {
            cTorque[0] = -this._torqueLimit * this._torqueScale[0];
        }
        if (cTorque[1] < -this._torqueLimit * this._torqueScale[1]) {
            cTorque[1] = -this._torqueLimit * this._torqueScale[1];
        }
        if (cTorque[2] < -this._torqueLimit * this._torqueScale[2]) {
            cTorque[2] = -this._torqueLimit * this._torqueScale[2];
        }

        // Back to parent coordinates
        cTorque = utils.rotateVector(cTorque, utils.RFromQuaternion(qToChild));

        // to World coordinates.
        return utils.rotateVector(cTorque, utils.RFromQuaternion(this.parent.getOrientation()));
    }

    addTorqueX(t) {
        this._torque[0] += t;
    }
    addTorqueY(t) {
        this._torque[1] += t;
    }
    addTorqueZ(t) {
        this._torque[2] += t;
    }

    addTorque(t) {
        // torque in parent coords
        this._torque[0] += t[0];
        this._torque[1] += t[1];
        this._torque[2] += t[2];
    }

    resetTorque() {
        this.torque = [0, 0, 0];
    }


    get position() {
        return this._position;
    }

    set position(xyz) {
        this._position[0] = xyz[0];
        this._position[1] = xyz[1];
        this._position[2] = xyz[2];
    }

    get angle() {
        return this._angle;
    }

    set angle(angs) {
        this._angle = angs;
    }

    get angularVelocity() {
        return this._angularVelocity;
    }

    get torque() {
        return this._torque;
    }

    set torque(t) {
        this._torque[0] = t[0];
        this._torque[1] = t[1];
        this._torque[2] = t[2];
    }

    get type() {
        return this._type;
    }

}

export default Ball;
