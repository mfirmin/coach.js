
import utils from '../utils/utils';

import Ammo from '../lib/ammo';

/* eslint-disable new-cap */
// const toDeg = 180.0 / Math.PI;
const toRad = Math.PI / 180.0;
const trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking
const Tpos = new Ammo.btVector3(0, 0, 0);
const Tneg = new Ammo.btVector3(0, 0, 0);

class Simulator {
    constructor(dt, opts) {
        this.dt = dt;

        this.opts = (opts === undefined) ? {} : opts;

        this.is2D = (opts['2D'] === undefined) ? false : opts['2D'];

        this.callback = this.opts.callback;

        this.entities = {};
        this.joints = {};

        this.initialize();
    }

    initialize() {
        // every single |new| currently leaks...
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.overlappingPairCache = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher,
            this.overlappingPairCache,
            this.solver,
            this.collisionConfiguration,
        );

        const gravity = (this.opts.gravity === undefined) ? [0, -9.81, 0] : this.opts.gravity;

        this.dynamicsWorld.setGravity(new Ammo.btVector3(gravity[0], gravity[1], gravity[2]));
    }

    destroy() {
        Ammo.destroy(this.collisionConfiguration);
        Ammo.destroy(this.dispatcher);
        Ammo.destroy(this.overlappingPairCache);
        Ammo.destroy(this.solver);
        // XXX gives an error for some reason,
        // |getBroadphase()->getOverlappingPairCache()->cleanProxyFromPairs(bp, m_dispatcher1);
        // | in btCollisionWorld.cpp throws a 'pure virtual' failure
        // Ammo.destroy(dynamicsWorld);
    }

    setCallback(fn) {
        this.callback = fn;
    }

    addJoint(j) {
        let joint;
        const type = j.type;
        if (type === 'BALL') {
            const pos = j.position;
            const posA = this.entities[j.parent.name].entity.position;
            const jointPosInA = [pos[0] - posA[0], pos[1] - posA[1], pos[2] - posA[2]];
            const pivotInA = new Ammo.btVector3(jointPosInA[0], jointPosInA[1], jointPosInA[2]);

            const posB = this.entities[j.child.name].entity.position;
            const jointPosInB = [pos[0] - posB[0], pos[1] - posB[1], pos[2] - posB[2]];
            const pivotInB = new Ammo.btVector3(jointPosInB[0], jointPosInB[1], jointPosInB[2]);

            joint = new Ammo.btPoint2PointConstraint(
                this.entities[j.parent.name].body,
                this.entities[j.child.name].body,
                pivotInA,
                pivotInB,
            );

            /*
            if (j.limits['X'] !== undefined) {
                joint.setLimit(3, j.limits['X'][0]*Math.PI/180, j.limits['X'][1]*Math.PI/180);
            }
            if (j.limits['Y'] !== undefined) {
                joint.setLimit(4, j.limits['Y'][0]*Math.PI/180, j.limits['Y'][1]*Math.PI/180);
            }
            if (j.limits['Z'] !== undefined) {
                joint.setLimit(5, j.limits['Z'][0]*Math.PI/180, j.limits['Z'][1]*Math.PI/180);
            }
            */
            /*
            if (j.B === undefined) {
                joint = new Ammo.btPoint2PointConstraint(
                    this.entities[j.A].body,
                    new Ammo.btVector3(jointPosInA[0], jointPosInA[1], jointPosInA[2])
                );
            }
            */
        } else if (type === 'HINGE') {
            // const axis = j.axis;
            const pos = j.position;
            const posA = this.entities[j.parent.name].entity.position;
            const jointPosInA = [pos[0] - posA[0], pos[1] - posA[1], pos[2] - posA[2]];

            if (j.child !== undefined) {
                const posB = this.entities[j.child.name].entity.position;
                const jointPosInB = [pos[0] - posB[0], pos[1] - posB[1], pos[2] - posB[2]];
                joint = new Ammo.btHingeConstraint(
                    this.entities[j.parent.name].body,
                    this.entities[j.child.name].body,
                    new Ammo.btVector3(jointPosInA[0], jointPosInA[1], jointPosInA[2]),
                    new Ammo.btVector3(jointPosInB[0], jointPosInB[1], jointPosInB[2]),
                    new Ammo.btVector3(j.axis[0], j.axis[1], j.axis[2]),
                    new Ammo.btVector3(j.axis[0], j.axis[1], j.axis[2]),
                    false,
                );
            } else {
                // TODO: FIX ME?
                // THIS DOESNT WORK

                joint = new Ammo.btHingeConstraint(
                    this.entities[j.parent.name].body,
                    new Ammo.btVector3(jointPosInA[0], jointPosInA[1], jointPosInA[2]),
                    new Ammo.btVector3(j.axis[0], j.axis[1], j.axis[2]),
                    false,
                );
            }

            if (j.lo !== undefined) {
                joint.setLimit(j.lo * toRad, j.hi * toRad, 0.1, 1.0, 0.3);
    //            joint.setLimit(-0.1, 0.1, 0.8, .3, .9);
            }
        }

        this.dynamicsWorld.addConstraint(joint);

        this.joints[j.name] = { joint: j, jointBullet: joint };
    }

    addEntity(e) {
        let shape;
        switch (e.type) {
            case 'SPHERE':
                shape = new Ammo.btSphereShape(e.radius);
                break;
            case 'BOX':
                shape = new Ammo.btBoxShape(
                    new Ammo.btVector3(e.sides[0] / 2.0, e.sides[1] / 2.0, e.sides[2] / 2.0),
                );
                break;
            case 'CAPSULE':
                shape = new Ammo.btCapsuleShape(e.radius, e.height);
                break;
            case 'CYLINDER':
                shape = new Ammo.btCylinderShape(
                    new Ammo.btVector3(e.radius, e.height / 2.0, e.radius),
                );
                break;
            default:
                throw new Error('Simulator.addEntity: Unknown type');

        }

        const startTransform = new Ammo.btTransform();
        startTransform.setIdentity();

        const mass = e.mass;
        const isDynamic = (mass !== 0);

        const localInertia = new Ammo.btVector3(0, 0, 0);

        if (isDynamic) {
            shape.calculateLocalInertia(mass, localInertia);
        }

        const pos = e.position;
        startTransform.setOrigin(new Ammo.btVector3(pos[0], pos[1], pos[2]));

        const myMotionState = new Ammo.btDefaultMotionState(startTransform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
            mass,
            myMotionState,
            shape,
            localInertia,
        );
        const body = new Ammo.btRigidBody(rbInfo);

        // SET 2D
        if (this.is2D) {
            body.setLinearFactor(new Ammo.btVector3(1, 1, 0));
            body.setAngularFactor(new Ammo.btVector3(0, 0, 1));
        }
    //    body.setAngularFactor(new Ammo.btVector3(1, 0, 1));

        // eslint-disable-next-line no-unused-vars
        const nothing = 0;
        const human = 1 << 0;
        const ground = 1 << 1;
        if (e.name === 'ground') {
            this.dynamicsWorld.addRigidBody(body, ground, human);
        } else {
            this.dynamicsWorld.addRigidBody(body, human, ground);
        }

        this.entities[e.name] = { entity: e, body };
    }

    step(callback) {
        for (const name of Object.keys(this.joints)) {
            const j = this.joints[name].joint;
            const A = this.entities[j.parent.name].body;
            const B = this.entities[j.child.name].body;

            if (A.isActive() === 0) {
                A.setActivationState(1);
            }

            if (B.isActive() === 0) {
                B.setActivationState(1);
            }

            const T = j.getLimitedTorque();

            Tpos.setX(T[0]); Tneg.setX(-T[0]);
            Tpos.setY(T[1]); Tneg.setY(-T[1]);
            Tpos.setZ(T[2]); Tneg.setZ(-T[2]);

            A.applyTorque(Tpos);
            B.applyTorque(Tneg);

            j.resetTorque();
        }

        this.dynamicsWorld.stepSimulation(this.dt, 1, this.dt);

        for (const name of Object.keys(this.entities)) {
            const e = this.entities[name];
            const body = e.body;
            body.activate();
            const entity = e.entity;
            if (body.getMotionState()) {
                body.getMotionState().getWorldTransform(trans);
                const pos = [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()];

                const rot = trans.getRotation().normalized();
                entity.position = pos;
                entity.orientation = [rot.w(), rot.x(), rot.y(), rot.z()];

                const angVel = body.getAngularVelocity();
                entity.angularVelocity = [angVel.x(), angVel.y(), angVel.z()];
            }
        }

        for (const name of Object.keys(this.joints)) {
            const j = this.joints[name];
            const jointEntity = j.joint;
            const jointBullet = j.jointBullet;
            if (jointEntity.type === 'HINGE') {
                jointEntity.updateAngle(jointBullet.getHingeAngle(), this.dt);
                const tform = jointBullet.getFrameOffsetA();

                const body = jointBullet.getRigidBodyA();
                body.getMotionState().getWorldTransform(trans);

                const pos = [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()];

                const jointVec = [
                    tform.getOrigin().x(),
                    tform.getOrigin().y(),
                    tform.getOrigin().z(),
                ];

                const axis = trans.getRotation().normalized();
                const vec = utils.rotateVector(
                    jointVec,
                    utils.RFromQuaternion([
                        axis.w(), axis.x(), axis.y(), axis.z(),
                    ]),
                );

                jointEntity.position = [pos[0] + vec[0], pos[1] + vec[1], pos[2] + vec[2]];
            } else if (jointEntity.type === 'BALL') {
                jointEntity.calculateOrientation();
                jointEntity.calculateAngularVelocity();
            }
        }
        if (this.callback !== undefined) {
            this.callback(this.dt);
        }
    }
}

export default Simulator;
/* eslint-enable */
