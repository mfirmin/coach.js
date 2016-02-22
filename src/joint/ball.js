var Joint = require('./joint');
var utils = require('../utils/utils');

function Ball(name, parent, child, pos, opts) {

    Joint.call(this, name, parent, child);

    opts = (opts === undefined) ? {} : opts;

    this.position = pos;

    this.angleLast = [1,0,0,0];
    this.angle = [1,0,0,0];

    this.angularVelocity = [0,0,0];
    this.angularVelocityPrev = this.angularVelocity;
    this.torque = [0,0,0];

    this.limits = (opts.limits === undefined) ? {} : opts.limits;
    this.torqueScale = (opts.torqueScale === undefined) ? [1,1,1] : opts.torqueScale;
    this.torqueLimit = (opts.torqueLimit  === undefined) ? 10000 : opts.torqueLimit;
}

Ball.prototype = Object.create(Joint.prototype);

Ball.prototype.constructor = Ball;

Ball.prototype.initialize = function() {
};
Ball.prototype.getPosition = function() {
    return this.position;
};

Ball.prototype.setPosition = function(xyz) {
    this.position[0] = xyz[0];
    this.position[1] = xyz[1];
    this.position[2] = xyz[2];
};

// Calculates joint's orientation in terms of Parent coordinates (ie, quaternion to rotate parent to child.)
Ball.prototype.calculateOrientation = function() {
    var pOrientation = this.parent.getOrientation();
    var cOrientation = this.child.getOrientation();

    this.angle = utils.multiplyQuaternions(utils.getQuaternionInverse(pOrientation), cOrientation);

};

// Calculates joint's angular velocity in Parent coordinate frame
Ball.prototype.calculateAngularVelocity = function() {

    var pAngVel = this.parent.getAngularVelocity();
    var cAngVel = this.child.getAngularVelocity();

    var wRel = [cAngVel[0] - pAngVel[0],cAngVel[1] - pAngVel[1],cAngVel[2] - pAngVel[2]];

//    console.log(this.parent.getOrientation());

    this.angularVelocity = utils.rotateVector(wRel, utils.RFromQuaternion(utils.getQuaternionInverse(this.parent.getOrientation())));
//    this.angularVelocity = wRel;
};

Ball.prototype.setAngle = function(angs, dt) {
    this.angle = angs;
    return;
};

Ball.prototype.getAngle = function() {
    return this.angle;
};

Ball.prototype.getAngularVelocity = function() {
    return this.angularVelocity;
};

Ball.prototype.getTorque = function() {
    return this.torque;
};

Ball.prototype.getLimitedTorque = function() {
    var scope = this;

    // get the torque in child coordinates...
    var qToChild = this.getAngle();
    var qInverse = [qToChild[0], -qToChild[1], -qToChild[2], -qToChild[3]];
    var cTorque = utils.rotateVector(this.torque, utils.RFromQuaternion(qInverse));

    cTorque = [cTorque[0]*this.torqueScale[0], cTorque[1]*this.torqueScale[1], cTorque[2]*this.torqueScale[2]];

    if (cTorque[0] > this.torqueLimit*this.torqueScale[0]) { cTorque[0] = this.torqueLimit*this.torqueScale[0]; }
    if (cTorque[0] < -this.torqueLimit*this.torqueScale[0]) { cTorque[0] = -this.torqueLimit*this.torqueScale[0]; }
    if (cTorque[1] > this.torqueLimit*this.torqueScale[1]) { cTorque[1] = this.torqueLimit*this.torqueScale[1]; }
    if (cTorque[1] < -this.torqueLimit*this.torqueScale[1]) { cTorque[1] = -this.torqueLimit*this.torqueScale[1]; }
    if (cTorque[2] > this.torqueLimit*this.torqueScale[2]) { cTorque[2] = this.torqueLimit*this.torqueScale[2]; }
    if (cTorque[2] < -this.torqueLimit*this.torqueScale[2]) { cTorque[2] = -this.torqueLimit*this.torqueScale[2]; }

    // Back to parent coordinates
    cTorque = utils.rotateVector(cTorque, utils.RFromQuaternion(qToChild));

    // to World coordinates.
    var ret = utils.rotateVector(cTorque, utils.RFromQuaternion(this.parent.getOrientation()));

    return ret;
};

Ball.prototype.addTorqueX = function(t) {
    this.torque[0] += t;
};
Ball.prototype.addTorqueY = function(t) {
    this.torque[1] += t;
};
Ball.prototype.addTorqueZ = function(t) {
    this.torque[2] += t;
};

Ball.prototype.addTorque = function(t) {
    this.torque[0] += t[0];
    this.torque[1] += t[1];
    this.torque[2] += t[2];
};

Ball.prototype.setTorque = function(t) {
    this.torque = t;
};

Ball.prototype.resetTorque = function() {
    this.setTorque([0,0,0]);
};


Ball.prototype.getType = function() {
    return 'BALL';
};

module.exports = Ball;
