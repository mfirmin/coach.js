

var utils = {};

utils.multiplyQuaternions = function(q, r) {

    var t0 = (q[0]*r[0] - q[1]*r[1] - q[2]*r[2] - q[3]*r[3]);
    var t1 = (q[0]*r[1] + q[1]*r[0] + q[2]*r[3] - q[3]*r[2]);
    var t2 = (q[0]*r[2] - q[1]*r[3] + q[2]*r[0] + q[3]*r[1]);
    var t3 = (q[0]*r[3] + q[1]*r[2] - q[2]*r[1] + q[3]*r[0]);

    return utils.normalizeQuaternion( [t0, t1, t2, t3]);
};

utils.normalizeQuaternion = function(q) {
    var mag = Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3]);

    return [q[0]/mag,q[1]/mag,q[2]/mag,q[3]/mag];
};

utils.getQuaternionInverse = function(q) {
    // q[0] = qw

    return [q[0], -q[1], -q[2], -q[3]];
};

utils.axisAngleFromQuaternion = function(q) {

    var qw = q[0];
    var qx = q[1];
    var qy = q[2];
    var qz = q[3];

    var angle = 2*Math.acos(qw);

    if (isNaN(angle) || Math.abs(angle) < 1e-6 ) { angle = 0; }

    var axis;
    if (angle === 0) {
        axis = [1,0,0];
    } else {
        var den = 1*Math.sqrt(1-qw*qw);
            axis = [qx/den, qy/den, qz/den]
    }

    if (axis[0] === 0 && axis[1] === 0 && axis[2] === 0) { axis = [1,0,0]; }

    return {"axis": axis, "angle": angle};

};

utils.quaternionFromEulerAngles = function(e) {
    var phi = e[0];
    var theta = e[1];
    var psi = e[2];
    var q = [
        Math.cos(phi/2)*Math.cos(theta/2)*Math.cos(psi/2) + Math.sin(phi/2)*Math.sin(theta/2)*Math.sin(psi/2),
        Math.sin(phi/2)*Math.cos(theta/2)*Math.cos(psi/2) - Math.cos(phi/2)*Math.sin(theta/2)*Math.sin(psi/2),
        Math.cos(phi/2)*Math.sin(theta/2)*Math.cos(psi/2) + Math.sin(phi/2)*Math.cos(theta/2)*Math.sin(psi/2),
        Math.cos(phi/2)*Math.cos(theta/2)*Math.sin(psi/2) - Math.sin(phi/2)*Math.sin(theta/2)*Math.cos(psi/2)
    ];

    var mag = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);

    return [q[0]/mag, q[1]/mag, q[2]/mag, q[3]/mag];
};

utils.eulerAnglesFromQuaternion = function(q) {
    var qw = q[0];
    var qx = q[1];
    var qy = q[2];
    var qz = q[3];

    return [
        Math.atan2(2*(qw*qx + qy*qz), 1 - 2*(qx*qx+qy*qy)),
        Math.asin(2*qw*qy-qz*qx),
        Math.atan2(2*(qw*qz+qx*qy), 1 - 2*(qy*qy+qz*qz))
    ];
};

// Q = [q.x, q.y, q.z, q.w]
utils.RFromQuaternion = function(q) {

    var qw = q[0];
    var qx = q[1];
    var qy = q[2];
    var qz = q[3];

    return [ 1 - 2*qy*qy - 2*qz*qz, 2*qx*qy - 2*qz*qw,     2*qx*qz + 2*qy*qw,
             2*qx*qy + 2*qz*qw,     1 - 2*qx*qx - 2*qz*qz, 2*qy*qz - 2*qx*qw,
             2*qx*qz - 2*qy*qw,     2*qy*qz + 2*qx*qw,     1 - 2*qx*qx - 2*qy*qy ]

};

// v = [x, y, z]
// R = flat Rotation matrix
utils.rotateVector = function(v, R) {
    if (R.length === 9) {
        return [R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
                R[3]*v[0] + R[4]*v[1] + R[5]*v[2],
                R[6]*v[0] + R[7]*v[1] + R[8]*v[2]];
    } else if (R.length === 16) {
        return [R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
                R[4]*v[0] + R[5]*v[1] + R[6]*v[2],
                R[8]*v[0] + R[9]*v[1] + R[10]*v[2]];
    } else {
        throw 'Cannot have rotation matrix with length ' + R.length;
    }
};

module.exports = utils;
