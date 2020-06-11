import { three as THREE } from '../lib/index';

class Intersector {
    constructor(world) {
        this._world    = world;
        this._renderer = world.renderer;
        this._element  = world.renderer.element;
        this._camera   = world.renderer.camera.threeCamera;

        this._entities = {};
        this._objects  = [];
        this._objectToEntity = {};

        this._intersectPlane = {
            point:  [0, 0, 0],
            normal: [0, 1, 0],
        };

        this._raycaster = new THREE.Raycaster();

        // mouse in NDC (-1..+1)
        this._mouse = new THREE.Vector2();

        this._world.intersector = this;

        this.initializeHandlers();
    }

    addEntity(e) {
        const object = this._renderer.getObjectForEntity(e.id).children[0];
        this._entities[e.id] = e;
        this._objectToEntity[object.id] = e;
        this._objects.push(object);
    }

    getPlaneIntersect() {
        const P = this._intersectPlane.point;
        const N = this._intersectPlane.normal;

        const ro = this._raycaster.ray.origin;
        const rd = this._raycaster.ray.direction.clone().normalize();

        const t = P.clone().sub(ro).dot(N) / (rd.dot(N));

        const isect = ro.clone().add(rd.multiplyScalar(t));

        return {
            t,
            point: isect,
        };
    }

    getIntersect() {
        const intersects = this._raycaster.intersectObjects(this._objects);

        if (intersects.length === 0) {
            return { entity: null, point: null };
        }

        const isect = intersects[0];

        return {
            entity: this._objectToEntity[isect.object.id],
            point:  isect.point,
        };
    }

    testIntersect() {
        return this._raycaster.intersectObjects(this._objects).length > 0;
    }

    handleMouseDown(evt) {
        const { entity, point } = this.getIntersect();
        this._md = { entity, point, pid: null };
        if (entity !== null) {
            this._md.pid = this._world.simulator.beginPick(entity, point);
//            entity.dynamic = false;

            const viewVector = this._renderer.camera.viewVector;

            this._intersectPlane.point  = point.clone();
            this._intersectPlane.normal = (new THREE.Vector3(
                viewVector[0],
                0,
                // viewVector[1],
                viewVector[2],
            )).normalize().multiplyScalar(-1);

//            const pos = entity.position;
//            // vector to point from entity's CoM
//            this._md.point = point.clone().sub(new THREE.Vector3(pos[0], pos[1], pos[2]));
        }
    }

    handleMouseMove(evt) {
        if (this._md.pid !== null) {
            const { point } = this.getPlaneIntersect();
            this._world.simulator.updatePick(this._md.pid, point);
//            const mdPos = this._md.point;

//            const newPos = point.clone().sub(mdPos);
//
//            this._md.entity.position = [newPos.x, newPos.y, newPos.z];
        }
    }

    handleMouseUp(evt) {
        if (this._md.pid !== null) {
            this._world.simulator.finishPick(this._md.pid);
 //           this._md.entity.dynamic = true;
        }

        this._md.pid    = null;
        this._md.entity = null;
        this._md.point  = null;
    }

    handleMouseHover() {
        for (const entity of Object.values(this._entities)) {
            entity.highlighted = false;
        }
        const { entity } = this.getIntersect();
        if (entity !== null) {
            entity.highlighted = true;
        }
    }

    updateRaycaster(x, y) {
        this._mouse.x = ((x / this._element.width) * 2) - 1;
        this._mouse.y = (-(y / this._element.height) * 2) + 1;
        this._raycaster.setFromCamera(this._mouse, this._camera);
    }

    initializeHandlers() {
        let mousedown = false;
        this._md = { entity: null, point: null };
        this._mouseDragged = false;

        this._mouseDownEvent  = null;
        this._mouseMoveEvent  = null;
        this._mouseHoverEvent = null;
        this._mouseUpEvent    = null;

        this._element.addEventListener('mousedown', (e) => {
            this._mouseDownEvent = e;
            this._mouseDragged = false;

            this.updateRaycaster(e.clientX, e.clientY);
            if (this.testIntersect()) {
                e.stopPropagation();
            }

            mousedown = true;
        }, false);

        this._element.addEventListener('mousemove', (e) => {
            this._mouseDragged = true;
            if (mousedown) {
                this._mouseMoveEvent = e;
            } else {
                this._mouseHoverEvent = e;
            }
        }, false);

        this._element.addEventListener('mouseup', (e) => {
            this._mouseUpEvent = e;
            this._mouseDragged = false;
            mousedown = false;
        }, false);
    }

    handleEvents() {
        if (this._mouseDownEvent) {
            this.updateRaycaster(this._mouseDownEvent.clientX, this._mouseDownEvent.clientY);
            this.handleMouseDown(this._mouseDownEvent);
        }
        if (this._mouseMoveEvent) {
            this.updateRaycaster(this._mouseMoveEvent.clientX, this._mouseMoveEvent.clientY);
            this.handleMouseMove(this._mouseMoveEvent);
        }
        if (this._mouseHoverEvent) {
            this.updateRaycaster(this._mouseHoverEvent.clientX, this._mouseHoverEvent.clientY);
            this.handleMouseHover(this._mouseHoverEvent);
        }
        if (this._mouseUpEvent) {
            this.updateRaycaster(this._mouseUpEvent.clientX, this._mouseUpEvent.clientY);
            this.handleMouseUp(this._mouseUpEvent);
        }

        this._mouseDownEvent  = null;
        this._mouseMoveEvent  = null;
        this._mouseHoverEvent = null;
        this._mouseUpEvent    = null;
    }
}

export default Intersector;
