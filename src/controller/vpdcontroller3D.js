
var utils = require('../utils/utils');

var KP = 300;
var KD = 30;

function VPDController3D(joint, part, goal, options) {

    var goalEuler = [
        (goal["X"] === undefined) ? 0 : goal["X"],
        (goal["Y"] === undefined) ? 0 : goal["Y"],
        (goal["Z"] === undefined) ? 0 : goal["Z"]
    ];
    this.goal = utils.quaternionFromEulerAngles(goalEuler);
    this.joint = joint;
    this.part = part;

    options = (options === undefined) ? {} : options;

    this.kp = (options.kp === undefined) ? KP : options.kp;
    this.kd = (options.kd === undefined) ? KD : options.kd;
    this.goalVelocity = (options.goalVelocity === undefined) ? 0 : optionsgoalVelocity;

    this.lastAngle;

}

VPDController3D.prototype.constructor = VPDController3D;

VPDController3D.prototype.evaluate = function(dt) {

    var torque = [0,0,0];

    var qRel = this.part.getOrientation();

    var cInverse = [qRel[0], -qRel[1], -qRel[2], -qRel[3]];

    // qErr in world coordinates
    var qErr = utils.multiplyQuaternions(cInverse, this.goal);

    var sinTheta = Math.sqrt(qErr[1]*qErr[1]+qErr[2]*qErr[2]+qErr[3]*qErr[3]);
    if (sinTheta > 1) { sinTheta = 1; }
    if (Math.abs(sinTheta) < 1e-8) { }
    else {
        var absAngle = 2*Math.asin(sinTheta);
        var multiplier = 1/sinTheta*absAngle*(-this.kp)*Math.abs(qErr[0])/qErr[0];
        torque = [qErr[1]*multiplier, qErr[2]*multiplier, qErr[3]*multiplier];
    }

    torque = utils.rotateVector(torque, utils.RFromQuaternion(qRel));
    // wRel in world coords
    var wRel = this.part.getAngularVelocity();
    torque[0] += -wRel[0]*(-this.kd);
    torque[1] += -wRel[1]*(-this.kd);
    torque[2] += -wRel[2]*(-this.kd);

    // rotate torque into parent coords
//    torque = utils.rotateVector(torque, utils.RFromQuaternion(utils.getQuaternionInverse(this.joint.parent.getOrientation())));

    return torque;

};

VPDController3D.prototype.setGoal = function(g) {

    var goalEuler = [
        (g["X"] === undefined) ? 0 : g["X"],
        (g["Y"] === undefined) ? 0 : g["Y"],
        (g["Z"] === undefined) ? 0 : g["Z"]
    ];
    this.goal = utils.normalizeQuaternion(utils.quaternionFromEulerAngles(goalEuler));
};



module.exports = VPDController3D;
