var Joint = require('./joint');

function Hinge(name, parent, child, pos, axis, opts) {

    Joint.call(this, name, parent, child);

    opts = (opts === undefined) ? {} : opts;

    this.position = pos;
    this.axis = axis;

    this.angle = (opts.angle === undefined) ? 0 : opts.angle;
    this.angularVelocity = (opts.angularVelocity === undefined) ? 0 : opts.angularVelocity;
    this.angularVelocityPrev = this.angularVelocity;
    this.torque = [0,0,0];

    limits = (opts.limits === undefined) ? {} : opts.limits;

    this.lo = limits.lo;
    this.hi = limits.hi;

    this.torqueLimit = (opts.torqueLimit  === undefined) ? 370 : opts.torqueLimit;

}

Hinge.prototype = Object.create(Joint.prototype);

Hinge.prototype.constructor = Hinge;

Hinge.prototype.initialize = function() {
}

Hinge.prototype.getAxis = function() {
    return this.axis;
};

Hinge.prototype.getPosition = function() {
    return this.position;
};

Hinge.prototype.setPosition = function(xyz) {
    this.position[0] = xyz[0];
    this.position[1] = xyz[1];
    this.position[2] = xyz[2];
};

Hinge.prototype.getAngle = function() {
    return this.angle;
};

Hinge.prototype.setAngle = function(ang, dt) {
    var angleLast = this.angle;
    this.angle = ang;
    if (dt !== undefined) {
        this.angularVelocityPrev = this.angularVelocity;
        this.angularVelocity = (this.angle - angleLast)*1/dt;
    }
};

Hinge.prototype.getAngularVelocity = function() {
//    return (this.angularVelocityPrev + this.angularVelocity)/2.; // average angVel over 2 timesteps.
//    return 0;
    return this.angularVelocity;
};

Hinge.prototype.setAngularVelocity = function(angVel) {
    this.angularVelocity = angVel;
};

Hinge.prototype.resetTorque = function() {
    this.setTorque([0,0,0]);
};

Hinge.prototype.setTorque = function(t) {
    this.torque = t;
};

Hinge.prototype.addTorque = function(t) {
    this.torque[2] += t;
};

Hinge.prototype.getTorque = function() {
    return this.torque;
};

Hinge.prototype.getLimitedTorque = function() {
    var ret = this.torque;
    if (Math.abs(ret[2]) > this.torqueLimit) {
        ret[2] = this.torqueLimit * ret[2]/Math.abs(ret[2]);
    }

    return ret;
};

Hinge.prototype.getType = function() {
    return 'HINGE';
};

module.exports = Hinge;
