import Sphere   from './entity/sphere';
import Box      from './entity/box';
import Capsule  from './entity/capsule';
import Hinge    from './joint/hinge';
import Ball     from './joint/ball';

class Character {

    constructor(name, opts = {}) {
        this.name = name;
        this.initialize();
        this.entities = {};
        this.joints = {};
    }

    addEntity(e) {
        this.entities[e.name] = e;
    }

    addJoint(j) {
        this.joints[j.name] = j;
    }

    setFromJSON(data, overlayMesh) {
        if (overlayMesh !== undefined) {
            this._overlayMesh = overlayMesh;
        }

        for (const [e, eInfo] of Object.entries(data.parts)) {
            const name = `${this.name}.${e}`;

            let entity;
            switch (eInfo.type) {
                case 'SPHERE':
                    entity = new Sphere(name, eInfo.radius, { mass: eInfo.mass });
                    break;
                case 'CAPSULE':
                    entity = new Capsule(
                        name,
                        (eInfo.radiusTop + eInfo.radiusBottom) / 2.0,
                        eInfo.height,
                        { mass: eInfo.mass },
                    );
                    break;
                case 'BOX':
                    entity = new Box(name, eInfo.sides, { mass: eInfo.mass });
                    break;
                default:
                    throw new Error(`Unknown Entity type: ${eInfo.type}`);
            }
            entity.setPosition(eInfo.position);
            this.addEntity(entity);
        }
        for (const [j, jInfo] of Object.entries(data.joints)) {
            const name = `${this.name}.${j}`;

            let joint;
            switch (jInfo.type) {
                case 'HINGE':
                    joint = new Hinge(name,
                                      this.entities[`${this.name}.${jInfo.A}`],
                                      this.entities[`${this.name}.${jInfo.B}`],
                                      jInfo.position,
                                      jInfo.axis,
                        {
                            limits: {
                                lo: jInfo.min[2],
                                hi: jInfo.max[2],
                            },
                        });

                    break;
                case 'BALL':
                    joint = new Ball(name,
                                     this.entities[`${this.name}.${jInfo.A}`],
                                     this.entities[`${this.name}.${jInfo.B}`],
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
                        });
                    break;
                default:
                    throw new Error(`Unknown Joint type: ${jInfo.type}`);
            }
            this.addJoint(joint);
        }
    }
}

export default Character;
