var Joint = require('./joint');

function Ball(name, entityNames, pos, limits) {

    Joint.call(this, name);

    this.A = entityNames.A;
    this.B = entityNames.B;

    this.position = pos;

    this.angle = [0,0,0];

    this.angularVelocity = [0,0,0];
    this.angularVelocityPrev = this.angularVelocity;
    this.torque = [0,0,0];

    this.limits = (limits === undefined) ? {} : limits;

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

Ball.prototype.setAngle = function(angs, dt) {
    var angleLast = this.angle;
    this.angle = angs;
    if (dt !== undefined) {
        this.angularVelocityPrev = this.angularVelocity;
        this.angularVelocity = [(this.angle[0] - angleLast[0])*1/dt,(this.angle[1] - angleLast[1])*1/dt,(this.angle[2] - angleLast[2])*1/dt];
    }
};

Ball.prototype.getAngle = function() {
    return this.angle;
};

Ball.prototype.getTorque = function() {
    return this.torque;
};

Ball.prototype.getLimitedTorque = function() {
    var ret = this.torque[0];
    if (Math.abs(ret) > this.torqueLimit) {
        ret = this.torqueLimit * ret/Math.abs(ret);
        return ret;
    }

    return this.torque[0];
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
