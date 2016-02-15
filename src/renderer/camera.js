

var THREE = require('../lib/three.min');

function Camera(opts) {

    opts = (opts === undefined) ? {} : opts;

    console.log(opts);
    this.type = (opts.type === undefined) ? "perspective" : opts.type;

    this.initialize(opts);

}


Camera.prototype.constructor = Camera;

Camera.prototype.initialize = function(opts) {

    if (this.type === "perspective") {
        this.setPerspective(opts);
    } else {
        this.setOrthographic(opts)
    }


    var pos = (opts.position === undefined) ? [0,0,5] : opts.position;
    this.setPosition(pos);

    var target = (opts.target === undefined) ? [0,0,0] : opts.target;
    this.setTarget(target);

};

Camera.prototype.setPerspective = function(opts) {

    this.type = "perspective";

    this.threeCamera = new THREE.PerspectiveCamera(
        (opts.fov === undefined) ? 45 : opts.fov,
        (opts.aspect === undefined) ? 1 : opts.aspect,
        (opts.near === undefined) ? 1 : opts.near,
        (opts.far === undefined) ? 2000 : opts.far
    );

    return this.threeCamera;
};

Camera.prototype.setOrthographic = function(opts) {

    this.type = "orthographic";

    this.threeCamera = new THREE.OrthographicCamera(
        (opts.left === undefined) ? -2 : opts.left,
        (opts.right === undefined) ? 2 : opts.right,
        (opts.top === undefined) ? 2 : opts.top,
        (opts.bottom === undefined) ? -2 : opts.bottom,
        (opts.near === undefined) ? 1 : opts.near,
        (opts.far === undefined) ? 2000 : opts.far
    );

    return this.threeCamera;
};

Camera.prototype.getPosition = function() {
    return [this.threeCamera.position.x, this.threeCamera.position.y, this.threeCamera.position.z];
};

Camera.prototype.setPosition = function(pos) {
    this.threeCamera.position.x = pos[0];
    this.threeCamera.position.y = pos[1];
    this.threeCamera.position.z = pos[2];
};

Camera.prototype.setTarget = function(target) {
    this.threeCamera.lookAt(new THREE.Vector3(target[0], target[1], target[2]));
};

Camera.prototype.setAspectRatio = function(aspect) {
    if (this.type === "perspective") {
        this.threeCamera.aspect = aspect;
    }
    this.threeCamera.updateProjectionMatrix();
};

module.exports = Camera;
