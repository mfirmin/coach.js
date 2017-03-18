const KP = 300;
const KD = 30;

const utils = require('../utils/utils');

class PDController3D {

    init(joint, goal, options = {}) {
        const goalEuler = [
            (goal.X === undefined) ? 0 : goal.X,
            (goal.Y === undefined) ? 0 : goal.Y,
            (goal.Z === undefined) ? 0 : goal.Z,
        ];

        this.goal = utils.quaternionFromEulerAngles(goalEuler);
        this.joint = joint;

        this.kp = (options.kp === undefined) ? KP : options.kp;
        this.kd = (options.kd === undefined) ? KD : options.kd;
        this.goalVelocity = (options.goalVelocity === undefined) ? 0 : options.goalVelocity;
    }

    evaluate() {
        let torque = [0, 0, 0];

        const qRel = this.joint.getAngle();

        const cInverse = [qRel[0], -qRel[1], -qRel[2], -qRel[3]];

        // extra needed on top of qRel to rotate into goal!
        const qErr = utils.multiplyQuaternions(cInverse, this.goal);

        let sinTheta = Math.sqrt((qErr[1] * qErr[1]) + (qErr[2] * qErr[2]) + (qErr[3] * qErr[3]));
        if (sinTheta > 1) { sinTheta = 1; }

        if (Math.abs(sinTheta) >= 1e-8) {
            const absAngle = 2 * Math.asin(sinTheta);
            const stInv = 1.0 / sinTheta;

            const multiplier = ((stInv) * absAngle * (-this.kp) * Math.abs(qErr[0])) / qErr[0];

            torque = [qErr[1] * multiplier, qErr[2] * multiplier, qErr[3] * multiplier];
        }

        // torque in parent coords
        torque = utils.rotateVector(torque, utils.RFromQuaternion(qRel));
        // wRel in parent coords
        const wRel = this.joint.getAngularVelocity();
        torque[0] += -wRel[0] * (-this.kd);
        torque[1] += -wRel[1] * (-this.kd);
        torque[2] += -wRel[2] * (-this.kd);

        // torque in parent coords
        return torque;

        // TODO: Remove this?
        /*
        const axisAngle = utils.axisAngleFromQuaternion(rotQ);

        const axLen = Math.sqrt(
            (axisAngle.axis[0] * axisAngle.axis[0]) +
            (axisAngle.axis[1] * axisAngle.axis[1]) +
            (axisAngle.axis[2]*axisAngle.axis[2])
        );

        const vq = [
            (axisAngle.axis[0] / axLen) * axisAngle.angle,
            (axisAngle.axis[1] / axLen) * axisAngle.angle,
            (axisAngle.axis[2] / axLen) * axisAngle.angle
        ];

        const signW = rotQ[0]/Math.abs(rotQ[0]);

        vq = [vq[0]*signW, vq[1]*signW, vq[2]*signW];


        const w = this.joint.getAngularVelocity();

        const ret = [
             this.kp*(vq[0]) - this.kd*w[0],
             this.kp*(vq[1]) - this.kd*w[1],
             this.kp*(vq[2]) - this.kd*w[2]
        ];

        ret = utils.rotateVector(ret, utils.RFromQuaternion(this.joint.parent.getOrientation()));

        return [-ret[0], -ret[1], -ret[2]];
        */
    }

    setGoal(g) {
        const goalEuler = [
            (g.X === undefined) ? 0 : g.X,
            (g.Y === undefined) ? 0 : g.Y,
            (g.Z === undefined) ? 0 : g.Z,
        ];
        this.goal = utils.normalizeQuaternion(utils.quaternionFromEulerAngles(goalEuler));
    }
}

export default PDController3D;
