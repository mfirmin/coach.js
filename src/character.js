var World       = require('./world/world');
var Sphere      = require('./entity/sphere');
var Box         = require('./entity/box');
var Capsule     = require('./entity/capsule');
var Cylinder    = require('./entity/cylinder');
var Hinge       = require('./joint/hinge');
var Ball        = require('./joint/ball');

function Character(name, opts) {

    this.opts = (opts === undefined) ? {} : opts;

    this.name = name;

    this.initialize();
}

Character.prototype.constructor = Character;

Character.prototype.initialize = function() {
    this.entities = {};
    this.joints = {};
};

Character.prototype.setFromJSON = function(data, overlayMesh) {

    if (overlayMesh !== undefined) {
        this._overlayMesh = overlayMesh;
    }

    for (var e in data.parts) {
        var eInfo = data.parts[e];

        var name = this.name + '.' +  e;

        var entity;
        switch (eInfo.type) {
            case "SPHERE":
                entity = new Sphere(name, eInfo.radius, { "mass": eInfo.mass });
                break;
            case "CAPSULE":
                entity = new Capsule(name, (eInfo.radiusTop + eInfo.radiusBottom)/2.0, eInfo.height, {"mass": eInfo.mass});
                break;
            case "BOX":
                entity = new Box(name, eInfo.sides, { "mass": eInfo.mass });
                break;
            default:
                throw "Unknown Entity type: " + eInfo.type;
        }
        entity.setPosition(eInfo.position);
        var offset = 0.01;
        this.addEntity(entity);
    }
    for (var j in data.joints) {
        var jInfo = data.joints[j];

        var name = this.name + '.' + j;

        var joint;
        switch(jInfo.type) {
            case "HINGE":
                joint = new Hinge(name,
                                  this.entities[this.name+'.'+jInfo.A],
                                  this.entities[this.name+'.'+jInfo.B],
                                  jInfo.position,
                                  jInfo.axis,
                                  {
                                      limits: {
                                          "lo": jInfo.min[2],
                                          "hi": jInfo.max[2]
                                      }
                                  });

                break;
            case "BALL":
                joint = new Ball(name,
                                 this.entities[this.name+'.'+jInfo.A],
                                 this.entities[this.name+'.'+jInfo.B],
                                 jInfo.position,
                                 {
                                     limits: {
                                         "X": [jInfo.min[0], jInfo.max[0]],
                                         "Y": [jInfo.min[1], jInfo.max[1]],
                                         "Z": [jInfo.min[2], jInfo.max[2]],
                                     },
                                     torqueScale: [
                                         jInfo.torqueScale[0],
                                         jInfo.torqueScale[1],
                                         jInfo.torqueScale[2]
                                     ]
                                 });
                break;
            default:
                throw "Unknown Joint type: " + jInfo.type;
        }
        this.addJoint(joint);
    }

};

Character.prototype.addEntity = function(e) {
    this.entities[e.name] = e;
};

Character.prototype.addJoint = function(j) {
    this.joints[j.name] = j;
};


module.exports = Character;
