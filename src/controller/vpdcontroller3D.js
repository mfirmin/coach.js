
import utils from '../utils/utils';

const KP = 300;
const KD = 30;

class VPDController3D {

    constructor(joint, part, goal, options = {}) {
        const goalEuler = [
            (goal.X === undefined) ? 0 : goal.X,
            (goal.Y === undefined) ? 0 : goal.Y,
            (goal.Z === undefined) ? 0 : goal.Z,
        ];

        this.goal  = utils.quaternionFromEulerAngles(goalEuler);
        this.joint = joint;
        this.part  = part;

        this.kp = (options.kp === undefined) ? KP : options.kp;
        this.kd = (options.kd === undefined) ? KD : options.kd;
        this.goalVelocity = (options.goalVelocity === undefined) ? 0 : options.goalVelocity;
    }

    evaluate(dt) {
        let torque = [0, 0, 0];

        const qRel = this.part.orientation;

        const cInverse = [qRel[0], -qRel[1], -qRel[2], -qRel[3]];

        // qErr in world coordinates
        const qErr = utils.multiplyQuaternions(cInverse, this.goal);

        let sinTheta = Math.sqrt(
            (qErr[1] * qErr[1]) +
            (qErr[2] * qErr[2]) +
            (qErr[3] * qErr[3]),
        );

        if (sinTheta > 1) {
            sinTheta = 1;
        }
        if (Math.abs(sinTheta) >= 1e-8) {
            const absAngle = 2 * Math.asin(sinTheta);
            const stInv = 1.0 / sinTheta;
            const multiplier = (stInv * absAngle * (-this.kp) * Math.abs(qErr[0])) / qErr[0];

            torque = [qErr[1] * multiplier, qErr[2] * multiplier, qErr[3] * multiplier];
        }

        torque = utils.rotateVector(torque, utils.RFromQuaternion(qRel));
        // wRel in world coords
        const wRel = this.part.angularVelocity;
        torque[0] += -wRel[0] * (-this.kd);
        torque[1] += -wRel[1] * (-this.kd);
        torque[2] += -wRel[2] * (-this.kd);

        // rotate torque into parent coords
        torque = utils.rotateVector(
            torque,
            utils.RFromQuaternion(utils.getQuaternionInverse(this.joint.parent.orientation)),
        );

        return torque;
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

export default VPDController3D;
