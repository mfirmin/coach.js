/* global $, document */
import THREE                from '../lib/three.min';
import ConvexHullGrahamScan from '../lib/graham_scan.min';

import Camera from './camera';

class Renderer {
    init(opts = {}, element) {
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

    addCylinder(e, options = {}) {
        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ?
            options.mesh.color : e.color;

        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
    //    const cstring = 'rgb(255,0,0)';
        const color = new THREE.Color(cstring);

        const cylinder = new THREE.Object3D();

        const mat = new THREE.MeshPhongMaterial({
            color,
            specular:  0x030303,
            shininess: 10,
            shading:   THREE.SmoothShading,
        });

        if (options.mesh === undefined) {
            const cylGeom = new THREE.CylinderGeometry(
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
            const geom = new THREE.Geometry();
            const chuller = new ConvexHullGrahamScan();
            for (let i = 0; i < options.mesh.vertices.length; i++) {
                geom.vertices.push(new THREE.Vector3(
                    options.mesh.vertices[i][0],
                    options.mesh.vertices[i][1],
                    options.mesh.vertices[i][2],
                ));
            }
            for (let i = 0; i < options.mesh.faces.length; i++) {
                geom.faces.push(new THREE.Face3(
                options.mesh.faces[i][0],
                    options.mesh.faces[i][1],
                    options.mesh.faces[i][2],
                ));
                chuller.addPoint(
                    options.mesh.vertices[options.mesh.faces[i][0]][0],
                    options.mesh.vertices[options.mesh.faces[i][0]][1],
                );
                chuller.addPoint(
                    options.mesh.vertices[options.mesh.faces[i][1]][0],
                    options.mesh.vertices[options.mesh.faces[i][1]][1],
                );
                chuller.addPoint(
                    options.mesh.vertices[options.mesh.faces[i][2]][0],
                    options.mesh.vertices[options.mesh.faces[i][2]][1],
                );
            }

            geom.computeFaceNormals();
            geom.computeVertexNormals();
            const mesh = new THREE.Mesh(geom, mat);

            const hullPoints = chuller.getHull();
            const lineGeo = new THREE.Geometry();
            for (let i = 0; i < hullPoints.length; i++) {
                lineGeo.vertices.push(
                    new THREE.Vector3(
                        hullPoints[i].x,
                        hullPoints[i].y,
                        0.003 + options.mesh.vertices[0][2],
                    ),
                );
            }
            const lineMat = new THREE.LineBasicMaterial({
                color:     new THREE.Color(0, 0, 0),
                linewidth: 1,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            cylinder.add(line);
            cylinder.add(mesh);
        }

        return cylinder;
    }

    addCapsule(e, options) {
        options = (options === undefined) ? {} : options;

        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ? options.mesh.color : e.color;

        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
    //    const cstring = 'rgb(255,0,0)';
        const color = new THREE.Color(cstring);

        const capsule = new THREE.Object3D();
        const mat = new THREE.MeshPhongMaterial({ color, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading });
        if (options.mesh === undefined) {
            const cylGeom = new THREE.CylinderGeometry(e.getRadius(), e.getRadius(), e.getHeight(), 32, 4, true);
            const sph_geo = new THREE.SphereGeometry(e.getRadius(), 32, 32);
            const cylMesh = new THREE.Mesh(cylGeom, mat);
            const top_mesh = new THREE.Mesh(sph_geo, mat);
            const btm_mesh = new THREE.Mesh(sph_geo, mat);
            top_mesh.position.y = e.getHeight() / 2.0;
            btm_mesh.position.y = -e.getHeight() / 2.0;

            capsule.add(cylMesh);
            capsule.add(top_mesh);
            capsule.add(btm_mesh);
        } else {
            const geo = new THREE.Geometry();
            const chuller = new ConvexHullGrahamScan();
            for (const i = 0; i < options.mesh.vertices.length; i++) {
                geo.vertices.push(new THREE.Vector3(options.mesh.vertices[i][0], options.mesh.vertices[i][1], options.mesh.vertices[i][2]));
            }
            for (const i = 0; i < options.mesh.faces.length; i++) {
                geo.faces.push(new THREE.Face3(options.mesh.faces[i][0], options.mesh.faces[i][1], options.mesh.faces[i][2]));
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][0]][0], options.mesh.vertices[options.mesh.faces[i][0]][1]);
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][1]][0], options.mesh.vertices[options.mesh.faces[i][1]][1]);
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][2]][0], options.mesh.vertices[options.mesh.faces[i][2]][1]);
            }
            geo.computeFaceNormals();
            geo.computeVertexNormals();
            const mesh = new THREE.Mesh(geo, mat);
            capsule.add(mesh);

            const hullPoints = chuller.getHull();
            const lineGeo = new THREE.Geometry();
            for (const i = 0; i < hullPoints.length; i++) {
                // lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 5));
                lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 0.003 + options.mesh.vertices[0][2]));
            }
            const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0, 0, 0), linewidth: 1 });
            const line = new THREE.Line(lineGeo, lineMat);
            capsule.add(line);
        }

        return capsule;
    }

    addSphere(e, options) {
        options = (options === undefined) ? {} : options;

        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ? options.mesh.color : e.color;
        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
    //    const cstring = 'rgb(255,0,0)';
        const color = new THREE.Color(cstring);

        const obj3 = new THREE.Object3D();

        if (options.mesh === undefined) {
            const geo = new THREE.SphereGeometry(e.getRadius(), 32, 32);
        } else {
            const chuller = new ConvexHullGrahamScan();
            const geo = new THREE.Geometry();
            for (const i = 0; i < options.mesh.vertices.length; i++) {
                geo.vertices.push(new THREE.Vector3(options.mesh.vertices[i][0], options.mesh.vertices[i][1], options.mesh.vertices[i][2]));
            }
            for (const i = 0; i < options.mesh.faces.length; i++) {
                geo.faces.push(new THREE.Face3(options.mesh.faces[i][0], options.mesh.faces[i][1], options.mesh.faces[i][2]));
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][0]][0], options.mesh.vertices[options.mesh.faces[i][0]][1]);
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][1]][0], options.mesh.vertices[options.mesh.faces[i][1]][1]);
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][2]][0], options.mesh.vertices[options.mesh.faces[i][2]][1]);
            }
            geo.computeFaceNormals();
            geo.computeVertexNormals();
            const hullPoints = chuller.getHull();
            const lineGeo = new THREE.Geometry();
            for (const i = 0; i < hullPoints.length; i++) {
                // lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 5));
                lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 0.003 + options.mesh.vertices[0][2]));
            }
            const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0, 0, 0), linewidth: 1 });
            const line = new THREE.Line(lineGeo, lineMat);
            obj3.add(line);
        }

        const mat = new THREE.MeshPhongMaterial({ color, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading });
        const mesh = new THREE.Mesh(geo, mat);

        obj3.add(mesh);


        return obj3;
    }

    addBox(e, options) {
        options = (options === undefined) ? {} : options;

        const c = (options.mesh !== undefined && options.mesh.color !== undefined) ? options.mesh.color : e.color;
        const cstring = `rgb(${c[0]},${c[1]},${c[2]})`;
    //    const cstring = 'rgb(255,0,0)';
        const color = new THREE.Color(cstring);

        const obj3 = new THREE.Object3D();

        const sides = e.getSides();
        if (options.mesh === undefined) {
            const geo = new THREE.BoxGeometry(sides[0], sides[1], sides[2]);
        } else {
            const chuller = new ConvexHullGrahamScan();
            const geo = new THREE.Geometry();
            for (const i = 0; i < options.mesh.vertices.length; i++) {
                geo.vertices.push(new THREE.Vector3(options.mesh.vertices[i][0], options.mesh.vertices[i][1], options.mesh.vertices[i][2]));
            }
            for (const i = 0; i < options.mesh.faces.length; i++) {
                geo.faces.push(new THREE.Face3(options.mesh.faces[i][0], options.mesh.faces[i][1], options.mesh.faces[i][2]));
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][0]][0], options.mesh.vertices[options.mesh.faces[i][0]][1]);
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][1]][0], options.mesh.vertices[options.mesh.faces[i][1]][1]);
                chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][2]][0], options.mesh.vertices[options.mesh.faces[i][2]][1]);
            }
            geo.computeFaceNormals();
            geo.computeVertexNormals();
            const hullPoints = chuller.getHull();
            const lineGeo = new THREE.Geometry();
            for (const i = 0; i < hullPoints.length; i++) {
                // lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 5));
                lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 0.003 + options.mesh.vertices[0][2]));
            }
            const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0, 0, 0), linewidth: 1 });
            const line = new THREE.Line(lineGeo, lineMat);
            obj3.add(line);
        }

        let mat;
        if (options.shader === undefined) {
            mat = new THREE.MeshPhongMaterial({ color, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading });
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

    addJoint(j) {
        const entity = { color: [255, 170, 0], getRadius() { return 0.06; } };
        const obj = this.addSphere(entity);

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
                obj = this.addSphere(e, options);
                break;
            case 'BOX':
                obj = this.addBox(e, options);
                break;
            case 'CAPSULE':
                obj = this.addCapsule(e, options);
                break;
            case 'CYLINDER':
                obj = this.addCylinder(e, options);
                break;
            default:
                break;
        }

        this.scene.add(obj);

        this.entities[e.name] = { entity: e, object: obj };
    }
}

export default Renderer;
