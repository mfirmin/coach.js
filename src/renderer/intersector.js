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

        this._raycaster = new THREE.Raycaster();

        // mouse in NDC (-1..+1)
        this._mouse = new THREE.Vector2();

        this.initializeHandlers();
    }

    addEntity(e) {
        const object = this._renderer.getObjectForEntity(e.id).children[0];
        this._entities[e.id] = e;
        this._objectToEntity[object.id] = e;
        this._objects.push(object);
    }

    getIntersect() {
        const intersects = this._raycaster.intersectObjects(this._objects);

        if (intersects.length === 0) {
            return null;
        }

        return this._objectToEntity[intersects[0].object.id];
    }

    handleMouseDown(evt) {
        const entity = this.getIntersect();
        if (entity !== null) {
            evt.stopPropagation();
            entity.dynamic = false;
        }
        this._mdEntity = entity;
    }

    handleMouseMove(evt) {
        if (this._mdEntity !== null) {
            const pos = this._mdEntity.position;
            this._mdEntity.position = [pos[0], pos[1] + 0.01, pos[2]];
        }
    }

    handleMouseUp(evt) {
        if (this._mdEntity !== null) {
            evt.stopPropagation();
            this._mdEntity.dynamic = true;
        }

        this._mdEntity = null;
    }

    handleMouseHover() {
        for (const entity of Object.values(this._entities)) {
            entity.highlighted = false;
        }
        const entity = this.getIntersect();
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
        this._mdEntity = null;
        this._mouseDragged = false;
        this._element.addEventListener('mousedown', (e) => {
            this.updateRaycaster(e.clientX, e.clientY);
            this.handleMouseDown(e);
            mousedown = true;
            this._mouseDragged = false;
        }, false);

        this._element.addEventListener('mousemove', (e) => {
            this._mouseDragged = true;
            this.updateRaycaster(e.clientX, e.clientY);
            if (mousedown) {
                this.handleMouseMove(e);
            } else {
                this.handleMouseHover(e);
            }
        }, false);

        this._element.addEventListener('mouseup', (e) => {
            this.updateRaycaster(e.clientX, e.clientY);
            this.handleMouseUp(e);
            mousedown = false;
        }, false);
    }
}

export default Intersector;
