
var utils = require('../utils/utils');

var Ammo  = require('../lib/ammo');

function Simulator(dt, opts) {


    this.dt = dt;

    this.opts = (opts === undefined) ? {} : opts;

    this.is2D = (opts["2D"] === undefined) ? false : opts["2D"];

    this.callback = this.opts.callback;

    this.entities = {};
    this.joints = {};

    this.initialize();
}

Simulator.prototype.constructor = Simulator;

Simulator.prototype.initialize = function() {
    this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.overlappingPairCache = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();

    this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);

    var gravity = (this.opts.gravity === undefined) ? [0, -9.81, 0] : this.opts.gravity;

    this.dynamicsWorld.setGravity(new Ammo.btVector3(gravity[0], gravity[1], gravity[2]));
};

Simulator.prototype.destroy = function() {
    Ammo.destroy(this.collisionConfiguration);
    Ammo.destroy(this.dispatcher);
    Ammo.destroy(this.overlappingPairCache);
    Ammo.destroy(this.solver);
      //Ammo.destroy(dynamicsWorld); // XXX gives an error for some reason, |getBroadphase()->getOverlappingPairCache()->cleanProxyFromPairs(bp,m_dispatcher1);| in btCollisionWorld.cpp throws a 'pure virtual' failure
};

Simulator.prototype.setCallback = function(fn) {
    this.callback = fn;
};

Simulator.prototype.addJoint = function(j) {

    var joint;
    var type = j.getType();
    if (type === 'BALL') {
        var pos = j.getPosition();
        var posA = this.entities[j.parent.name].entity.getPosition();
        var jointPosInA = [pos[0] - posA[0], pos[1] - posA[1], pos[2] - posA[2]];
        var pivotInA = new Ammo.btVector3(jointPosInA[0], jointPosInA[1], jointPosInA[2]);

        var posB = this.entities[j.child.name].entity.getPosition();
        var jointPosInB = [pos[0] - posB[0], pos[1] - posB[1], pos[2] - posB[2]];
        var pivotInB = new Ammo.btVector3(jointPosInB[0], jointPosInB[1], jointPosInB[2]);

        joint = new Ammo.btPoint2PointConstraint(this.entities[j.parent.name].body, this.entities[j.child.name].body, pivotInA, pivotInB);

        if (j.limits["X"] !== undefined) {
            joint.setLimit(3, j.limits["X"][0]*Math.PI/180, j.limits["X"][1]*Math.PI/180);
        }
        if (j.limits["Y"] !== undefined) {
            joint.setLimit(4, j.limits["Y"][0]*Math.PI/180, j.limits["Y"][1]*Math.PI/180);
        }
        if (j.limits["Z"] !== undefined) {
            joint.setLimit(5, j.limits["Z"][0]*Math.PI/180, j.limits["Z"][1]*Math.PI/180);
        }
        /*
        if (j.B === undefined) {
            joint = new Ammo.btPoint2PointConstraint(this.entities[j.A].body, new Ammo.btVector3(jointPosInA[0], jointPosInA[1], jointPosInA[2]));
        }
        */
    } else if (type === 'HINGE') {
        var axis = j.axis;
        var pos = j.getPosition();
        var posA = this.entities[j.parent.name].entity.getPosition();
        var jointPosInA = [pos[0] - posA[0], pos[1] - posA[1], pos[2] - posA[2]];

        if (j.B !== undefined) {
            var posB = this.entities[j.child.name].entity.getPosition();
            var jointPosInB = [pos[0] - posB[0], pos[1] - posB[1], pos[2] - posB[2]];
            joint = new Ammo.btHingeConstraint(
                this.entities[j.parent.name].body,
                this.entities[j.child.name].body,
                new Ammo.btVector3(jointPosInA[0],jointPosInA[1],jointPosInA[2]),
                new Ammo.btVector3(jointPosInB[0],jointPosInB[1],jointPosInB[2]),
                new Ammo.btVector3(j.axis[0], j.axis[1], j.axis[2]),
                new Ammo.btVector3(j.axis[0], j.axis[1], j.axis[2]),
                false
            );
        } else {

            // TODO: FIX ME?
            // THIS DOESNT WORK

            joint = new Ammo.btHingeConstraint(
                this.entities[j.parent.name].body,
                new Ammo.btVector3(jointPosInA[0],jointPosInA[1],jointPosInA[2]),
                new Ammo.btVector3(j.axis[0], j.axis[1], j.axis[2]),
                false
            );
        }

        if (j.lo !== undefined) {
            joint.setLimit(j.lo*Math.PI/180, j.hi*Math.PI/180, 0.1, 1.0, .3);
//            joint.setLimit(-0.1, 0.1, 0.8, .3, .9);
        }

    }

    this.dynamicsWorld.addConstraint(joint);


    this.joints[j.name] = {'joint': j, 'jointBullet': joint};

};

Simulator.prototype.addEntity = function(e) {

    var shape;
    switch (e.getType()) {
        case 'SPHERE':
            shape = new Ammo.btSphereShape(e.getRadius());
            break;
        case 'BOX':
            shape = new Ammo.btBoxShape(new Ammo.btVector3(e.sides[0]/2, e.sides[1]/2, e.sides[2]/2));
            break;
        case 'CAPSULE':
            shape = new Ammo.btCapsuleShape(e.getRadius(), e.getHeight());
            break;
        case 'CYLINDER':
            shape = new Ammo.btCylinderShape(new Ammo.btVector3(e.getRadius(), e.getHeight()/2., e.getRadius()));
            break;
        default:
            throw 'Unknown type';

    }

    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();

    var mass = e.mass;
    var isDynamic = (mass !== 0);

    var localInertia = new Ammo.btVector3(0, 0, 0);

    if (isDynamic)
      shape.calculateLocalInertia(mass,localInertia);

    var pos = e.getPosition();
    startTransform.setOrigin(new Ammo.btVector3(pos[0], pos[1], pos[2]));

    var myMotionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    // SET 2D
    if (this.is2D) {
        body.setLinearFactor(new Ammo.btVector3(1,1,0));
        body.setAngularFactor(new Ammo.btVector3(0,0,1));
    }
//    body.setAngularFactor(new Ammo.btVector3(1,0,1));

    var nothing = 0;
    var human = 1 << 0;
    var ground = 1 << 1;
    if (e.name === 'ground') {
        this.dynamicsWorld.addRigidBody(body, ground, human);
    } else {
        this.dynamicsWorld.addRigidBody(body, human, ground);
    }

    this.entities[e.name] = {'entity': e, 'body': body};

};

var trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking
var Tpos = new Ammo.btVector3(0,0,0);
var Tneg = new Ammo.btVector3(0,0,0);

Simulator.prototype.step = function(callback) {


    for (var name in this.joints) {
        var j = this.joints[name].joint;
        var A = this.entities[j.parent.name].body;
        var B = this.entities[j.child.name].body;

        if (A.isActive() === 0) {
            A.setActivationState(1);
        }

        if (B.isActive() === 0) {
            B.setActivationState(1);
        }

        var T = j.getLimitedTorque();

        Tpos.setX(T[0]); Tneg.setX(-T[0]);
        Tpos.setY(T[1]); Tneg.setY(-T[1]);
        Tpos.setZ(T[2]); Tneg.setZ(-T[2]);

//        A.applyTorque(Tpos);
//        B.applyTorque(Tneg);

        j.resetTorque();
    }

    this.dynamicsWorld.stepSimulation(this.dt, 1, this.dt);

    for (var name in this.entities) {
        var e = this.entities[name];
        var body = e.body;
        body.activate();
        var entity = e.entity;
        if (body.getMotionState()) {
            body.getMotionState().getWorldTransform(trans);
            var pos = [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()];

            var rot = trans.getRotation().normalized();
            entity.setPosition(pos);
            entity.setOrientation([rot.w(), rot.x(), rot.y(), rot.z()]);

            var angVel = body.getAngularVelocity();
            entity.setAngularVelocity([angVel.x(), angVel.y(), angVel.z()])
        }
    };
    for (var name in this.joints) {
        var j = this.joints[name];
        var jointEntity = j.joint;
        var jointBullet = j.jointBullet;
        if (jointEntity.getType() === 'HINGE') {
            jointEntity.setAngle(jointBullet.getHingeAngle(), this.dt);
        } else if (jointEntity.getType() === 'BALL') {
            jointEntity.calculateOrientation();
            jointEntity.calculateAngularVelocity();
        }
        /*
        var tform = jointBullet.getFrameOffsetA();

        var body = jointBullet.getRigidBodyA();
        body.getMotionState().getWorldTransform(trans);

        var pos = [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()];

        var jointVec = [tform.getOrigin().x(), tform.getOrigin().y(), tform.getOrigin().z()];

        var axis = trans.getRotation().normalized();
        var vec = utils.rotateVector(jointVec, utils.RFromQuaternion([axis.w(), axis.x(), axis.y(), axis.z()]));

        jointEntity.setPosition([pos[0] + vec[0], pos[1] + vec[1], pos[2] + vec[2]]);
        */

    };
    if (this.callback !== undefined) {
        this.callback(this.dt);
    }
};

module.exports = Simulator;

