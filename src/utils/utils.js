const utils = {};

utils.multiplyQuaternions = function multiplyQuaternions(q, r) {
    /* eslint-disable no-mixed-operators */
    const t0 = (q[0] * r[0]) - (q[1] * r[1]) - (q[2] * r[2]) - (q[3] * r[3]);
    const t1 = (q[0] * r[1]) + (q[1] * r[0]) + (q[2] * r[3]) - (q[3] * r[2]);
    const t2 = (q[0] * r[2]) - (q[1] * r[3]) + (q[2] * r[0]) + (q[3] * r[1]);
    const t3 = (q[0] * r[3]) + (q[1] * r[2]) - (q[2] * r[1]) + (q[3] * r[0]);
    /* eslint-enable */

    return utils.normalizeQuaternion([t0, t1, t2, t3]);
};

utils.normalizeQuaternion = function normalizeQuaternion(q) {
    const magInv = 1.0 / Math.sqrt((q[0] * q[0]) + (q[1] * q[1]) + (q[2] * q[2]) + (q[3] * q[3]));


    return [q[0] * magInv, q[1] * magInv, q[2] * magInv, q[3] * magInv];
};

// q[0] = qw
utils.getQuaternionInverse = function getQuaternionInverse(q) {
    return [q[0], -q[1], -q[2], -q[3]];
};

utils.axisAngleFromQuaternion = function axisAngleFromQuaternion(q) {
    const qw = q[0];
    const qx = q[1];
    const qy = q[2];
    const qz = q[3];

    let angle = 2 * Math.acos(qw);

    if (Number.isNaN(angle) || Math.abs(angle) < 1e-6) { angle = 0; }

    let axis;
    if (angle === 0) {
        axis = [1, 0, 0];
    } else {
        const den = 1.0 * Math.sqrt(1 - (qw * qw));
        axis = [qx / den, qy / den, qz / den];
    }

    if (axis[0] === 0 && axis[1] === 0 && axis[2] === 0) { axis = [1, 0, 0]; }

    return { axis, angle };
};

utils.quaternionFromEulerAngles = function quaternionFromEulerAngles(e) {
    const halfPhi   = e[0] * 0.5;
    const halfTheta = e[1] * 0.5;
    const halfPsi   = e[2] * 0.5;

    const cPhi   = Math.cos(halfPhi);
    const cTheta = Math.cos(halfTheta);
    const cPsi   = Math.cos(halfPsi);

    const sPhi   = Math.sin(halfPhi);
    const sTheta = Math.sin(halfTheta);
    const sPsi   = Math.sin(halfPsi);

    const q = [
        (cPhi * cTheta * cPsi) + (sPhi * sTheta * sPsi),
        (sPhi * cTheta * cPsi) - (cPhi * sTheta * sPsi),
        (cPhi * sTheta * cPsi) + (sPhi * cTheta * sPsi),
        (cPhi * cTheta * sPsi) - (sPhi * sTheta * cPsi),
    ];

    return utils.normalizeQuaternion(q);
};

utils.eulerAnglesFromQuaternion = function eulerAnglesFromQuaternion(q) {
    const qw = q[0];
    const qx = q[1];
    const qy = q[2];
    const qz = q[3];

    const qxqx = qx * qx;
    const qyqy = qy * qy;
    const qzqz = qz * qz;

    const qxqy = qx * qy;
    const qxqz = qx * qz;
    const qyqz = qy * qz;

    const qwqx = qw * qx;
    const qwqy = qw * qy;
    const qwqz = qw * qz;

    return [
        Math.atan2(2 * (qwqx + qyqz), 1 - (2 * (qxqx + qyqy))),
        Math.asin(2 * (qwqy - qxqz)),
        Math.atan2(2 * (qwqz + qxqy), 1 - (2 * (qyqy + qzqz))),
    ];
};

// Q = [q.x, q.y, q.z, q.w]
utils.RFromQuaternion = function RFromQuaternion(q) {
    const qw = q[0];
    const qx = q[1];
    const qy = q[2];
    const qz = q[3];

    const qxqx = qx * qx;
    const qyqy = qy * qy;
    const qzqz = qz * qz;

    const qxqy = qx * qy;
    const qxqz = qx * qz;
    const qyqz = qy * qz;

    const qwqx = qw * qx;
    const qwqy = qw * qy;
    const qwqz = qw * qz;

    /*
    return [a*a+b*b - c*c - d*d,    2*b*c - 2*a*d,         2*b*d + 2*a*c,
            2*b*c + 2*a*d,          a*a - b*b + c*c - d*d, 2*c*d - 2*a*b,
            2*b*d - 2*a*c,          2*c*d+2*a*b,           a*a-b*b-c*c+d*d];
            */

    /* eslint-disable no-multi-spaces */
    return [
        1 - (2 * qyqy) - (2 * qzqz), (2 * qxqy) - (2 * qwqz),     (2 * qxqz) + (2 * qwqy),
        (2 * qxqy) + (2 * qwqz),     1 - (2 * qxqx) - (2 * qzqz), (2 * qyqz) - (2 * qwqx),
        (2 * qxqz) - (2 * qwqy),     (2 * qyqz) + (2 * qwqx),     1 - (2 * qxqx) - (2 * qyqy),
    ];
    /* eslint-enable */
};

// v = [x, y, z]
// R = flat Rotation matrix
utils.rotateVector = function rotateVector(v, R) {
    if (R.length === 9) {
        return [
            (R[0] * v[0]) + (R[1] * v[1]) + (R[2] * v[2]),
            (R[3] * v[0]) + (R[4] * v[1]) + (R[5] * v[2]),
            (R[6] * v[0]) + (R[7] * v[1]) + (R[8] * v[2]),
        ];
    } else if (R.length === 16) {
        return [
            (R[0] * v[0]) + (R[1] * v[1]) + (R[2] * v[2]),
            (R[4] * v[0]) + (R[5] * v[1]) + (R[6] * v[2]),
            (R[8] * v[0]) + (R[9] * v[1]) + (R[10] * v[2]),
        ];
    }
    throw new Error(`Cannot have rotation matrix with length ${R.length}`);
};

export default utils;
