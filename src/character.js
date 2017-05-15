import Sphere   from './entity/sphere';
import Box      from './entity/box';
import Capsule  from './entity/capsule';
import Hinge    from './joint/hinge';
import Ball     from './joint/ball';

class Character {

    constructor(opts = {}) {
        this.id = (opts.id) === undefined ? Character.newID() : opts.id;

        if (Character._cGroupCount > 15) {
            throw new Error('Reached maximum number of Characters: 16');
        }
        this._collisionGroup = 1 << Character._cGroupCount;
        Character._cGroupCount++;

        this.entities = {};
        this.joints = {};

        this._world = null;
    }

    addEntity(e) {
        this.entities[e.id] = e;
        e.character = this;
        if (this.world && !this.world.hasEntity(e)) {
            this.world.addEntity(e);
        }
    }

    addJoint(j) {
        this.joints[j.id] = j;
        j.character = this; // eslint-disable-line no-param-reassign
        if (this.world && !this.world.hasJoint(j)) {
            this.world.addJoint(j);
        }
    }

    setFromJSON(data, overlayMesh) {
        if (overlayMesh !== undefined) {
            this._overlayMesh = overlayMesh;
        }

        for (const eInfo of Object.values(data.parts)) {
            let entity;
            switch (eInfo.type) {
                case 'SPHERE':
                    entity = new Sphere(eInfo.radius, { mass: eInfo.mass });
                    break;
                case 'CAPSULE':
                    entity = new Capsule(
                        (eInfo.radiusTop + eInfo.radiusBottom) / 2.0,
                        eInfo.height,
                        { mass: eInfo.mass },
                    );
                    break;
                case 'BOX':
                    entity = new Box(eInfo.sides, { mass: eInfo.mass });
                    break;
                default:
                    throw new Error(`Unknown Entity type: ${eInfo.type}`);
            }
            entity.setPosition(eInfo.position);
            this.addEntity(entity);
        }
        for (const jInfo of Object.values(data.joints)) {
            let joint;
            switch (jInfo.type) {
                case 'HINGE':
                    joint = new Hinge(
                        this.entities[`${this.id}.${jInfo.A}`],
                        this.entities[`${this.id}.${jInfo.B}`],
                        jInfo.position,
                        jInfo.axis,
                        {
                            limits: {
                                lo: jInfo.min[2],
                                hi: jInfo.max[2],
                            },
                        },
                    );
                    break;
                case 'BALL':
                    joint = new Ball(
                        this.entities[`${this.id}.${jInfo.A}`],
                        this.entities[`${this.id}.${jInfo.B}`],
                        jInfo.position,
                        {
                            limits: {
                                X: [jInfo.min[0], jInfo.max[0]],
                                Y: [jInfo.min[1], jInfo.max[1]],
                                Z: [jInfo.min[2], jInfo.max[2]],
                            },
                            torqueScale: [
                                jInfo.torqueScale[0],
                                jInfo.torqueScale[1],
                                jInfo.torqueScale[2],
                            ],
                        },
                    );
                    break;
                default:
                    throw new Error(`Unknown Joint type: ${jInfo.type}`);
            }
            this.addJoint(joint);
        }
    }

    get collisionGroup() {
        return this._collisionGroup;
    }

    static newID() {
        return Character._idCount++;
    }

    get world() {
        return this._world;
    }

    set world(w) {
        this._world = w;
    }
}

Character._cGroupCount = 0;
Character._idCount = 0;

export default Character;
