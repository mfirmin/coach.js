
var KP = 300;
var KD = 30;

var utils = require('../utils/utils');

function PDController3D(joint, goal, options) {

    var goalEuler = [
        (goal["X"] === undefined) ? 0 : goal["X"],
        (goal["Y"] === undefined) ? 0 : goal["Y"],
        (goal["Z"] === undefined) ? 0 : goal["Z"]
    ];
    this.goal = utils.quaternionFromEulerAngles(goalEuler);
    this.joint = joint;

    options = (options === undefined) ? {} : options;

    this.kp = (options.kp === undefined) ? KP : options.kp;
    this.kd = (options.kd === undefined) ? KD : options.kd;
    this.goalVelocity = (options.goalVelocity === undefined) ? 0 : optionsgoalVelocity;

}

PDController3D.prototype.constructor = PDController3D;

PDController3D.prototype.evaluate = function(dt) {

    var torque = [0,0,0];

    var qRel = this.joint.getAngle();

    var cInverse = [qRel[0], -qRel[1], -qRel[2], -qRel[3]];

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
    var wRel = this.joint.getAngularVelocity();
    torque[0] += -wRel[0]*(-this.kd);
    torque[1] += -wRel[1]*(-this.kd);
    torque[2] += -wRel[2]*(-this.kd);

    var ret = utils.rotateVector(torque, utils.RFromQuaternion(this.joint.parent.getOrientation()));

    return ret;

    /*
    var axisAngle = utils.axisAngleFromQuaternion(rotQ);

    var axLen = Math.sqrt(axisAngle.axis[0]*axisAngle.axis[0]+axisAngle.axis[1]*axisAngle.axis[1]+axisAngle.axis[2]*axisAngle.axis[2]);

    var vq = [axisAngle.axis[0]/axLen*axisAngle.angle, axisAngle.axis[1]/axLen*axisAngle.angle, axisAngle.axis[2]/axLen*axisAngle.angle];

    var signW = rotQ[0]/Math.abs(rotQ[0]);

    vq = [vq[0]*signW, vq[1]*signW, vq[2]*signW];


    var w = this.joint.getAngularVelocity();

    var ret = [
         this.kp*(vq[0]) - this.kd*w[0],
         this.kp*(vq[1]) - this.kd*w[1],
         this.kp*(vq[2]) - this.kd*w[2]
    ];

    ret = utils.rotateVector(ret, utils.RFromQuaternion(this.joint.parent.getOrientation()));

    return [-ret[0], -ret[1], -ret[2]];
    */

};

PDController3D.prototype.setGoal = function(g) {

    var goalEuler = [
        (g["X"] === undefined) ? 0 : g["X"],
        (g["Y"] === undefined) ? 0 : g["Y"],
        (g["Z"] === undefined) ? 0 : g["Z"]
    ];
    this.goal = utils.normalizeQuaternion(utils.quaternionFromEulerAngles(goalEuler));
};



module.exports = PDController3D;
