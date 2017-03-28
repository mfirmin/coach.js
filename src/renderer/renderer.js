/* global $, document */
import THREE                from '../lib/three.min';
import ConvexHullGrahamScan from '../lib/graham_scan.min';

import Camera from './camera';

class Renderer {
    constructor(opts = {}, element) {
        this.cameraOptions = opts.cameraOptions;

        this.initializeGL();
        this.initializeWorld();
        this.initializeDiv();

        this.entities = {};
        this.joints = {};

        this.callback = opts.callback;
        this.element = (element === undefined) ? 'body' : element;
    }


    initializeGL() {
        this.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            antialias:             true,
        });

        this.renderer.setClearColor(0xffffff, 1);
    }

    initializeWorld() {
        this.scene = new THREE.Scene();

        this.camera = new Camera(this.cameraOptions);

        this.scene.add(this.camera.threeCamera);

        this.light = new THREE.PointLight(0xfffffa, 1, 0);

        const pos = this.camera.getPosition();

        this.light.position.set(pos[0], pos[1], pos[2]);
        this.scene.add(this.light);
    }

    initializeDiv() {
        const scope = this;

        /*
        this.panel = $('<div>')
            .addClass('threeworld')
            .attr({tabindex:0})
            .css({
                position: 'absolute',
                width: 400,
                height: 400,
            });
        */
        this.panel = $('<div>')
            .addClass('coach-context')
            .attr({ tabindex: 0 });

        this.renderer.setSize(400, 400);

        this.canvas = $(this.renderer.domElement).width(400).height(400).addClass('three-canvas');
        $(this.panel).append(this.canvas);

        $(document).ready(() => {
            $(scope.element).append(scope.panel);
            scope.setSize();
        });
    }

    setSize() {
        const w = $(this.element).width();
        const h = $(this.element).height();

        this.canvas.width(w);
        this.canvas.height(h);

        this.renderer.setSize(w, h);

        this.camera.setAspectRatio(w / h);

    //    this.panel.css({width: w, height: h});
    }

    setCallback(fn) {
        this.callback = fn;
    }

    render(time) {
        this.updateEntities();
        if (this.callback !== undefined) {
            this.callback(this.camera, time);
        }
        this.renderer.render(this.scene, this.camera.threeCamera);
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
        this.joints[j.name] = { object: obj, joint: j };
    }

    addEntity(e, options) {
        const name = e.name;
        if (name in this.entities) {
            throw new Error(`Cannot add entity. Entity with name ${name} already exists.`);
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

        this.entities[e.name] = { entity: e, object: obj };
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
            const sides = e.getSides();
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
                e.getRadius(), // top radius
                e.getRadius(), // bottom radius
                e.getHeight(),
                32,
                4,
                true,
            );
            const sphGeo = new THREE.SphereBufferGeometry(e.getRadius(), 32, 32);
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
                e.getRadius(),
                e.getRadius(),
                e.getHeight(),
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
            const geo = new THREE.SphereBufferGeometry(e.getRadius(), 32, 32);
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
