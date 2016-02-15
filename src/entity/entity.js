
var utils = require('../utils/utils');

function Entity(name, opts) {

    this.opts = (opts === undefined) ? {} : opts;

    this.name = name;

    this.position = [0,0,0];
    this.orientation = [0,0,0,0]; // q.w, q.v
    this.angularVelocity = [0,0,0];
    this.mass = (opts.mass === undefined) ? 0 : opts.mass;
    this.color = (opts.color === undefined) ? [130,130,130] : opts.color;

    this.initialize();
}

Entity.prototype.constructor = Entity;

Entity.prototype.initialize = function() {
};

Entity.prototype.setPosition = function(xyz) {
    this.position[0] = xyz[0];
    this.position[1] = xyz[1];
    this.position[2] = xyz[2];
};

Entity.prototype.setOrientation = function(q) {
    this.orientation[0] = q[0];
    this.orientation[1] = q[1];
    this.orientation[2] = q[2];
    this.orientation[3] = q[3];
};

Entity.prototype.setAngularVelocity = function(a) {
    // Angular Velocity expressed in WORLD COORDINATES!

    this.angularVelocity[0] = a[0];
    this.angularVelocity[1] = a[1];
    this.angularVelocity[2] = a[2];

    // DO NOT INCLUDE THIS LINE 7 FEB 2016
//    this.angularVelocity = utils.rotateVector(this.angularVelocity, utils.RFromQuaternion(this.orientation));
};

Entity.prototype.getPosition = function() {
    return this.position;
};
Entity.prototype.getOrientation = function() {
    return this.orientation;
};

Entity.prototype.getAngle = function() {

};

Entity.prototype.getAngularVelocity = function() {
    return this.angularVelocity;
};

Entity.prototype.getMass = function() {
    return this.mass;
};

module.exports = Entity;
