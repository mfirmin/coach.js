var Renderer    = require('../renderer/renderer');
var Simulator   = require('../simulator/simulator');
var Box      = require('../entity/box');
var Cylinder = require('../entity/cylinder');
var Sphere   = require('../entity/sphere');
var Capsule  = require('../entity/capsule');
var Plane    = require('../entity/plane');

function World(opts, element) {

    opts = (opts === undefined) ? {} : opts;


    this.FPS = (opts.FPS === undefined) ? 30. : opts.FPS;
    this.dt  = (opts.dt === undefined) ? 0.0001 : opts.dt;
    this.is2D = (opts["2D"] === undefined) ? false : opts["2D"];

    this.renderer = new Renderer({"cameraOptions": opts.cameraOptions}, element);
    this.simulator = new Simulator(this.dt, {"2D": this.is2D});

    this.entities = {};
    this.joints   = {};
    this.characters = {};
}

World.prototype.constructor = World;

World.prototype.addJoint = function(j, opts) {
    opts = (opts === undefined) ? {} : opts;
    opts['render'] = (opts.render === undefined) ? false: opts.render;

    var name = j.name;
    if (name in this.entities) {
        console.error('Cannot add entity. Entity with name ' + name + 'already exists.');
        return -1;
    }

    if (opts.render) {
        this.renderer.addJoint(j);
    }

    this.simulator.addJoint(j);

    this.joints[name] = j;

};

World.prototype.addEntity = function(e, opts) {

    opts = (opts === undefined) ? {} : opts;
    opts['render'] = (opts.render === undefined) ? true : opts.render;

    opts['simulate'] = (opts.simulate === undefined) ? true : opts.simulate;

    var name = e.name;
    if (name in this.entities) {
        console.error('Cannot add entity. Entity with name ' + name + 'already exists.');
        return -1;
    }

    if (opts.render) {
        this.renderer.addEntity(e, opts);
    }

    if (opts.simulate) {
        this.simulator.addEntity(e);
    }

    this.entities[name] = e;

};

World.prototype.addCharacter = function(character, opts) {
    for (var e in character.entities) {

        var name = e.slice(e.indexOf('.')+1);
        var mesh = {"faces": opts.meshOverlay[name].faces, "vertices": opts.meshOverlay[name].vertices, "color": opts.meshOverlay[name].color}

        this.addEntity(character.entities[e], {"mesh": mesh});
    }
    for (var j in character.joints) {
        this.addJoint(character.joints[j]);
    }
};

World.prototype.go = function(opts) {

    var scope = this;
    var ready = true;
    var framerate = 1./(this.FPS);
    var framerateMS = framerate*1000;

    opts = (opts === undefined) ? {} : opts;

    this.simulator.setCallback(opts.simulationCallback);
    this.renderer.setCallback(opts.renderCallback);

    function animate() {

        requestAnimationFrame(animate);

        var now = Date.now();
        if (ready) {
            ready = false;
            var time = 0;
            while (Date.now() - now < framerateMS) {
                if (time < framerate) {
                    scope.step();
                    time += scope.dt;
                }
            }

            scope.render(time);
            ready = true;
        }
    }
    requestAnimationFrame(animate);
};

World.prototype.render = function(time) {
    this.renderer.render(time);
};

World.prototype.step = function() {
    this.simulator.step();
};

module.exports = World;
