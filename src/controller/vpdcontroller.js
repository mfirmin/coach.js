
const KP = 300;
const KD = 30;

class VPDController {
    constructor(joint, part, goal, options = {}) {
        this.joint = joint;
        this.part = part;
        this.goal = goal;

        this.kp = (options.kp === undefined) ? KP : options.kp;
        this.kd = (options.kd === undefined) ? KD : options.kd;
        this.goalVelocity = (options.goalVelocity === undefined) ? 0 : options.goalVelocity;

        this.lastAngle = NaN;
    }

    evaluate(dt) {
        const rot = this.part.orientation;
        const currentAngle = Math.atan2(
            2 * ((rot[0] * rot[3]) + (rot[1] * rot[2])),
            1 - (2 * ((rot[2] * rot[2]) + (rot[3] * rot[3]))),
        );

        if (Number.isNaN(this.lastAngle)) {
            this.lastAngle = currentAngle;
        }

        const currentAngularVelocity = (currentAngle - this.lastAngle) / dt;

        const goal = -this.goal;

        const angErr = goal - currentAngle;
        const angVelErr = 0 - currentAngularVelocity;

        const ret = (this.kp * angErr) + (this.kd * angVelErr);

        this.lastAngle = currentAngle;

        return ret;
    }
}

export default VPDController;
