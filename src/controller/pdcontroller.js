const KP = 300;
const KD = 30;

class PDController {
    constructor(joint, goal, options = {}) {
        this.goal = goal;
        this.joint = joint;

        this.kp = (options.kp === undefined) ? KP : options.kp;
        this.kd = (options.kd === undefined) ? KD : options.kd;
        this.goalVelocity = (options.goalVelocity === undefined) ? 0 : options.goalVelocity;
    }

    evaluate() {
        const currentAngle = this.joint.getAngle();
        const currentAngularVelocity = this.joint.getAngularVelocity();

        const angErr    = this.goal - currentAngle;
        const angVelErr = 0.0 - currentAngularVelocity;

        const ret = (this.kp * angErr) + (this.kd * angVelErr);

        return ret;
    }
}

export default PDController;
