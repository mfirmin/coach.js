/* global document, window */
import { three as THREE, VREffect } from '../lib/index';
import ConvexHullGrahamScan from '../lib/graham_scan.min';

import Camera from './camera';
import VRCamera from './vrCamera';

import $ from '../lib/jquery-2.1.4.min';

class Renderer {
    constructor(opts = {}) {
        this.cameraOptions = opts.cameraOptions;
        this.vrEnabled = (opts.VR === undefined) ? false : opts.VR;
        this.lightStyle = (opts.lightStyle === undefined) ? 'spotlight' : opts.lightStyle;

        this.initializeGL();
        this.initializeWorld();
        this.initializeDiv();

        this.entities = {};
        this.joints = {};

        this.callback = opts.callback;

//        this.element = (element === undefined) ? 'body' : element;
    }

    initializeGL() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);
//        this.renderer.setClearColor(0xffffff, 1);

        if (this.vrEnabled) {
            this.enableVR();
        }
    }

    initializeWorld() {
        this.scene = new THREE.Scene();

        if (this.vrEnabled) {
            this.camera = new VRCamera(this.cameraOptions);
        } else {
            this.camera = new Camera(this.cameraOptions);
        }

        this.scene.add(this.camera.threeCamera);

        this.light = new THREE.PointLight(0xfffffa, 1, 0);

        const pos = this.camera.position;

        this.light.position.set(pos[0], pos[1], pos[2]);
        this.scene.add(this.light);
    }

    initializeDiv() {
        $(document).ready(() => {
            document.body.appendChild(this.renderer.domElement);
            this.setSize();
        });

//        window.addEventListener('resize', () => this.setSize(), true);
    }

    enableVR() {
        this.effect = new VREffect(this.renderer);
        this.effect.setSize(window.innerWidth, window.innerHeight);
    }

    setSize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.renderer.setSize(w, h);

        if (this.vrEnabled && this.effect !== undefined) {
            this.effect.setSize(w, h);
        }

        this.camera.aspectRatio = w / h;
    }

    setCallback(fn) {
        this.callback = fn;
    }

    render(time) {
        this.updateEntities();
        if (this.lightStyle === 'spotlight') {
            const pos = this.camera.position;
            this.light.position.set(pos[0], pos[1], pos[2]);
        }
        if (this.callback !== undefined) {
            this.callback(this.camera, time);
        }
        if (this.vrEnabled) {
            this.effect.render(this.scene, this.camera.threeCamera);
        } else {
            this.renderer.render(this.scene, this.camera.threeCamera);
        }
    }


    updateEntities() {
        for (const e of Object.values(this.entities)) {
            const entity = e.entity;
            const obj = e.object;

            obj.position.x = entity.position[0];
            obj.position.y = entity.position[1];
            obj.position.z = entity.position[2];

            obj.rotation.setFromQuaternion(
                new THREE.Quaternion(
                    entity.orientation[1],
                    entity.orientation[2],
                    entity.orientation[3],
                    entity.orientation[0],
                ),
            );

            if (entity.highlighted) {
                obj.children[0].material.color.r = 0;
                obj.children[0].material.color.g = 1;
                obj.children[0].material.color.b = 1;
            } else {
                const color = entity.color.map(c => c / 255.0);
                obj.children[0].material.color.r = color[0];
                obj.children[0].material.color.g = color[1];
                obj.children[0].material.color.b = color[2];
            }
        }

        for (const j of Object.values(this.joints)) {
            const joint = j.joint;
            const obj = j.object;

            obj.position.x = joint.position[0];
            obj.position.y = joint.position[1];
            obj.position.z = joint.position[2];
        }
    }

    addJoint(j) {
        const entity = { color: [255, 170, 0], getRadius() { return 0.06; } };
        const obj = this.constructor.addSphere(entity);

        this.scene.add(obj);
        this.joints[j.id] = { object: obj, joint: j };
    }

    addEntity(e, options) {
        const id = e.id;
        if (id in this.entities) {
            throw new Error(`Cannot add entity. Entity with id ${id} already exists.`);
        }

        let obj;

        switch (e.type) {
            case 'SPHERE':
                obj = this.constructor.createSphere(e, options);
                break;
            case 'BOX':
                obj = this.constructor.createBox(e, options);
                break;
            case 'CAPSULE':
                obj = this.constructor.createCapsule(e, options);
                break;
            case 'CYLINDER':
                obj = this.constructor.createCylinder(e, options);
                break;
            default:
                break;
        }

        this.scene.add(obj);

        this.entities[e.id] = { entity: e, object: obj };
    }

    getObjectForEntity(e) {
        let id;
        if (typeof e === 'string' || typeof e === 'number') {
            id = e;
        } else if (e.id !== undefined) {
            id = e.id;
        } else {
            throw new Error(`Expected entity or id, got: ${e}`);
        }
        return this.entities[id].object;
    }

    get element() {
        return this.renderer.domElement;
    }

    static createMeshAndOutline(options) {
        const chuller = new ConvexHullGrahamScan();
        const geom = new THREE.BufferGeometry();

        const vs = options.mesh.vertices;
        const fs = options.mesh.faces;
        const positions = new Float32Array(vs.length * 3);
        const indices   = new Float32Array(fs.length * 3);

        for (let i = 0; i < vs.length; i++) {
            positions[(i * 3) + 0] = vs[i][0];
            positions[(i * 3) + 1] = vs[i][1];
            positions[(i * 3) + 2] = vs[i][2];
        }

        for (let i = 0; i < fs.length; i++) {
            indices[(i * 3) + 0] = fs[i][0];
            indices[(i * 3) + 1] = fs[i][1];
            indices[(i * 3) + 2] = fs[i][2];

            chuller.addPoint(vs[fs[i][0]][0], vs[fs[i][0]][1]);
            chuller.addPoint(vs[fs[i][1]][0], vs[fs[i][1]][1]);
            chuller.addPoint(vs[fs[i][2]][0], vs[fs[i][2]][1]);
        }

        geom.setIndex(new THREE.BufferAttribute(indices, 1));
        geom.addAttribute('position', new THREE.BufferAttribute(positions, 3));

        geom.computeFaceNormals();
        geom.computeVertexNormals();

        const hullPoints = chuller.getHull();
        const lineGeo = new THREE.BufferGeometry();
        const lgPositions = new Float32Array(hullPoints.length * 3);
        for (let i = 0; i < hullPoints.length; i++) {
            lgPositions[(i * 3) + 0] = hullPoints[i].x;
            lgPositions[(i * 3) + 1] = hullPoints[i].y;
            lgPositions[(i * 3) + 2] = 0.003 + vs[0][2];
        }

        lineGeo.addAttribute('position', new THREE.BufferAttribute(lgPositions, 3));

        const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0, 0, 0) });
        const outline = new THREE.Line(lineGeo, lineMat);

        return [geom, outline];
    }

    static createBox(e, options = {}) {
        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ?
            options.mesh.color : e.color;
        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
    //    const cstring = 'rgb(255,0,0)';
        const color = new THREE.Color(cstring);

        const obj3 = new THREE.Object3D();

        let geo;
        if (options.mesh === undefined) {
            const sides = e.sides;
            geo = new THREE.BoxBufferGeometry(sides[0], sides[1], sides[2]);
        } else {
            const ret = this.createMeshAndOutline(options);
            geo = ret[0];
            obj3.add(ret[1]);
        }

        let mat;
        if (options.shader === undefined) {
            mat = new THREE.MeshPhongMaterial({
                color,
                specular:  0x030303,
                shininess: 10,
                shading:   THREE.SmoothShading,
            });
        } else {
            mat = new THREE.ShaderMaterial({
                vertexShader:   document.getElementById(options.shader.vertexShader).textContent,
                fragmentShader: document.getElementById(options.shader.fragmentShader).textContent,
            });
        }

        const mesh = new THREE.Mesh(geo, mat);

        obj3.add(mesh);

        return obj3;
    }

    static createCapsule(e, options = {}) {
        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ?
            options.mesh.color : e.color;

        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
    //    const cstring = 'rgb(255,0,0)';
        const color = new THREE.Color(cstring);

        const capsule = new THREE.Object3D();
        const mat = new THREE.MeshPhongMaterial({
            color,
            specular:  0x030303,
            shininess: 10,
            shading:   THREE.SmoothShading,
        });
        if (options.mesh === undefined) {
            const cylGeom = new THREE.CylinderBufferGeometry(
                e.radius, // top radius
                e.radius, // bottom radius
                e.height,
                32,
                4,
                true,
            );
            const sphGeo = new THREE.SphereBufferGeometry(e.radius, 32, 32);
            const cylMesh = new THREE.Mesh(cylGeom, mat);
            const topMesh = new THREE.Mesh(sphGeo, mat);
            const btmMesh = new THREE.Mesh(sphGeo, mat);
            topMesh.position.y = e.getHeight() / 2.0;
            btmMesh.position.y = -e.getHeight() / 2.0;

            capsule.add(cylMesh);
            capsule.add(topMesh);
            capsule.add(btmMesh);
        } else {
            const ret = this.createMeshAndOutline(options);
            capsule.add(ret[0]);
            capsule.add(ret[1]);
        }

        return capsule;
    }

    static createCylinder(e, options = {}) {
        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ?
            options.mesh.color : e.color;

        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
        const color = new THREE.Color(cstring);

        const cylinder = new THREE.Object3D();

        const mat = new THREE.MeshPhongMaterial({
            color,
            specular:  0x030303,
            shininess: 10,
            shading:   THREE.SmoothShading,
        });

        if (options.mesh === undefined) {
            const cylGeom = new THREE.CylinderBufferGeometry(
                e.radius,
                e.radius,
                e.height,
                32,
                4,
                false,
            );
            const cylMesh = new THREE.Mesh(cylGeom, mat);
            cylinder.add(cylMesh);
        } else {
            const ret = this.createMeshAndOutline(options);
            cylinder.add(ret[0]);
            cylinder.add(ret[1]);
        }
        return cylinder;
    }

    static createSphere(e, options = {}) {
        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ?
            options.mesh.color : e.color;
        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
    //    const cstring = 'rgb(255,0,0)';
        const color = new THREE.Color(cstring);

        const sphere = new THREE.Object3D();

        if (options.mesh === undefined) {
            const geo = new THREE.SphereBufferGeometry(e.radius, 32, 32);
            const mat = new THREE.MeshPhongMaterial({
                color,
                specular:  0x030303,
                shininess: 10,
                shading:   THREE.SmoothShading,
            });
            const mesh = new THREE.Mesh(geo, mat);
            sphere.add(mesh);
        } else {
            const ret = this.createMeshAndOutline(options);
            sphere.add(ret[0]);
            sphere.add(ret[1]);
        }

        return sphere;
    }

}

export default Renderer;
