

var THREE = require('../lib/three.min');
var ConvexHullGrahamScan = require('../lib/graham_scan.min');

var $ = require('../lib/jquery-2.1.4.min');

var Camera   = require('./camera');

var Box      = require('../entity/box');
var Cylinder = require('../entity/cylinder');
var Sphere   = require('../entity/sphere');
var Capsule  = require('../entity/capsule');
var Plane    = require('../entity/plane');

function Renderer(opts, element) {

    opts = (opts === undefined) ? {} : opts;
    this.cameraOptions = opts.cameraOptions;

    this.initializeGL();
    this.initializeWorld();
    this.initializeDiv();

    this.entities = {};
    this.joints = {};

    this.callback = opts.callback;
    this.element = (element === undefined) ? 'body' : element;
}


Renderer.prototype.constructor = Renderer;

Renderer.prototype.initializeGL = function() {

    try{
        this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, antialias: true});
        this.renderType = 'webgl';
    }catch(e){
        try{
            this.renderer = new THREE.CanvasRenderer();
            this.renderType = 'canvas';
        }catch(e2){
            throw 'Could not initialize Renderer';
            return;
        }
    }
    this.error = false;

    this.renderer.setClearColor(0xffffff, 1);
};

Renderer.prototype.initializeWorld = function() {

    this.scene = new THREE.Scene();

    this.camera = new Camera(this.cameraOptions);

    this.scene.add(this.camera.threeCamera);

    this.light = new THREE.PointLight( 0xfffffa, 1, 0 );

    var pos = this.camera.getPosition();

    this.light.position.set(pos[0], pos[1], pos[2]);
    this.scene.add( this.light );

};

Renderer.prototype.initializeDiv = function() {

    var scope = this;

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
        .attr({tabindex:0});

    this.renderer.setSize(400,400);

    this.canvas = $(this.renderer.domElement).width(400).height(400).addClass("three-canvas");
    $(this.panel).append(this.canvas);

    $(document).ready(function() {
        $(scope.element).append(scope.panel);
        scope.setSize();
    });
};

Renderer.prototype.setSize = function() {

    var w = $(this.element).width();
    var h = $(this.element).height();

    this.canvas.width(w);
    this.canvas.height(h);

    this.renderer.setSize(w, h);

    this.camera.setAspectRatio(w/h);

//    this.panel.css({width: w, height: h});
};

Renderer.prototype.setCallback = function(fn) {
    this.callback = fn;
};

Renderer.prototype.render = function(time) {
    this.updateEntities();
    if (this.callback !== undefined) {
        this.callback(this.camera, time);
    }
    this.renderer.render(this.scene, this.camera.threeCamera);
};


Renderer.prototype.updateEntities = function() {

    for (var name in this.entities) {
        var entity = this.entities[name].entity;
        var obj = this.entities[name].object;

        obj.position.x = entity.position[0];
        obj.position.y = entity.position[1];
        obj.position.z = entity.position[2];

        obj.rotation.setFromQuaternion(new THREE.Quaternion(entity.rotation[0], entity.rotation[1], entity.rotation[2], entity.rotation[3]));
    }
    for (var name in this.joints) {

        var joint = this.joints[name].joint;
        var obj = this.joints[name].object;

        obj.position.x = joint.position[0];
        obj.position.y = joint.position[1];
        obj.position.z = joint.position[2];

    }
};

Renderer.prototype.addCylinder = function(e, options) {
    options = (options === undefined) ? {} : options;
    var c = (options.mesh !== undefined && options.mesh.color !== undefined) ? options.mesh.color : e.color;
    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var cylinder = new THREE.Object3D();

    var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: color, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
    if (options.mesh === undefined) {
        var cyl_geo = new THREE.CylinderGeometry(e.getRadius(), e.getRadius(), e.getHeight(), 32, 4, false);
        var cyl_mesh = new THREE.Mesh( cyl_geo , mat );

        cylinder.add(cyl_mesh);
    } else {
        var geo = new THREE.Geometry();
        var outline_pts = [];
        var chuller = new ConvexHullGrahamScan();
        for (var i = 0; i < options.mesh.vertices.length; i++) {
            geo.vertices.push(new THREE.Vector3(options.mesh.vertices[i][0], options.mesh.vertices[i][1], options.mesh.vertices[i][2]));
        }
        for (var i = 0; i < options.mesh.faces.length; i++) {
            geo.faces.push(new THREE.Face3(options.mesh.faces[i][0], options.mesh.faces[i][1], options.mesh.faces[i][2]));
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][0]][0], options.mesh.vertices[options.mesh.faces[i][0]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][1]][0], options.mesh.vertices[options.mesh.faces[i][1]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][2]][0], options.mesh.vertices[options.mesh.faces[i][2]][1]);
        }
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        var mesh = new THREE.Mesh( geo , mat );

        var hullPoints = chuller.getHull();
        var lineGeo = new THREE.Geometry();
        for (var i = 0; i < hullPoints.length; i++) {
            lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 0.003 + options.mesh.vertices[0][2]));
        }
        var lineMat = new THREE.LineBasicMaterial({color: new THREE.Color(0,0,0), linewidth: 1});
        var line = new THREE.Line(lineGeo, lineMat);
        cylinder.add(line);
        cylinder.add(mesh);
    }



    return cylinder;

};

Renderer.prototype.addCapsule = function(e, options) {
    options = (options === undefined) ? {} : options;

    var c = (options.mesh !== undefined && options.mesh.color !== undefined) ? options.mesh.color : e.color;

    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var capsule = new THREE.Object3D();
    var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: color, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
    if (options.mesh === undefined) {
        var cyl_geo = new THREE.CylinderGeometry(e.getRadius(), e.getRadius(), e.getHeight(), 32, 4, true);
        var sph_geo= new THREE.SphereGeometry(e.getRadius(), 32, 32);
        var cyl_mesh = new THREE.Mesh( cyl_geo , mat );
        var top_mesh = new THREE.Mesh( sph_geo , mat );
        var btm_mesh = new THREE.Mesh( sph_geo , mat );
        top_mesh.position.y = e.getHeight()/2.;
        btm_mesh.position.y = -e.getHeight()/2.;

        capsule.add(cyl_mesh);
        capsule.add(top_mesh);
        capsule.add(btm_mesh);
    } else {
        var geo = new THREE.Geometry();
        var chuller = new ConvexHullGrahamScan();
        for (var i = 0; i < options.mesh.vertices.length; i++) {
            geo.vertices.push(new THREE.Vector3(options.mesh.vertices[i][0], options.mesh.vertices[i][1], options.mesh.vertices[i][2]));
        }
        for (var i = 0; i < options.mesh.faces.length; i++) {
            geo.faces.push(new THREE.Face3(options.mesh.faces[i][0], options.mesh.faces[i][1], options.mesh.faces[i][2]));
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][0]][0], options.mesh.vertices[options.mesh.faces[i][0]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][1]][0], options.mesh.vertices[options.mesh.faces[i][1]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][2]][0], options.mesh.vertices[options.mesh.faces[i][2]][1]);
        }
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        var mesh = new THREE.Mesh( geo , mat );
        capsule.add(mesh);

        var hullPoints = chuller.getHull();
        var lineGeo = new THREE.Geometry();
        for (var i = 0; i < hullPoints.length; i++) {
            //lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 5));
            lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 0.003 + options.mesh.vertices[0][2]));
        }
        var lineMat = new THREE.LineBasicMaterial({color: new THREE.Color(0,0,0), linewidth: 1});
        var line = new THREE.Line(lineGeo, lineMat);
        capsule.add(line);
    }



    return capsule;

};

Renderer.prototype.addSphere = function(e, options) {

    options = (options === undefined) ? {} : options;

    var c = (options.mesh !== undefined && options.mesh.color !== undefined) ? options.mesh.color : e.color;
    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var obj3 = new THREE.Object3D();

    if (options.mesh === undefined) {
        var geo = new THREE.SphereGeometry(e.getRadius(), 32, 32);
    } else {
        var chuller = new ConvexHullGrahamScan();
        var geo = new THREE.Geometry();
        for (var i = 0; i < options.mesh.vertices.length; i++) {
            geo.vertices.push(new THREE.Vector3(options.mesh.vertices[i][0], options.mesh.vertices[i][1], options.mesh.vertices[i][2]));
        }
        for (var i = 0; i < options.mesh.faces.length; i++) {
            geo.faces.push(new THREE.Face3(options.mesh.faces[i][0], options.mesh.faces[i][1], options.mesh.faces[i][2]));
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][0]][0], options.mesh.vertices[options.mesh.faces[i][0]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][1]][0], options.mesh.vertices[options.mesh.faces[i][1]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][2]][0], options.mesh.vertices[options.mesh.faces[i][2]][1]);
        }
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        var hullPoints = chuller.getHull();
        var lineGeo = new THREE.Geometry();
        for (var i = 0; i < hullPoints.length; i++) {
            //lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 5));
            lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 0.003 + options.mesh.vertices[0][2]));
        }
        var lineMat = new THREE.LineBasicMaterial({color: new THREE.Color(0,0,0), linewidth: 1});
        var line = new THREE.Line(lineGeo, lineMat);
        obj3.add(line);
    }

    var mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: color, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
    var mesh = new THREE.Mesh( geo , mat );

    obj3.add(mesh);


    return obj3;

};

Renderer.prototype.addBox = function(e, options) {

    options = (options === undefined) ? {} : options;

    var c = (options.mesh !== undefined && options.mesh.color !== undefined) ? options.mesh.color : e.color;
    var cstring = 'rgb(' + c[0] + ','+ c[1]  + ',' + c[2]  + ')';
//    var cstring = 'rgb(255,0,0)';
    var color = new THREE.Color(cstring);

    var obj3 = new THREE.Object3D();

    var sides = e.getSides();
    if (options.mesh === undefined) {
        var geo = new THREE.BoxGeometry(sides[0], sides[1], sides[2]);
    } else {
        var chuller = new ConvexHullGrahamScan();
        var geo = new THREE.Geometry();
        for (var i = 0; i < options.mesh.vertices.length; i++) {
            geo.vertices.push(new THREE.Vector3(options.mesh.vertices[i][0], options.mesh.vertices[i][1], options.mesh.vertices[i][2]));
        }
        for (var i = 0; i < options.mesh.faces.length; i++) {
            geo.faces.push(new THREE.Face3(options.mesh.faces[i][0], options.mesh.faces[i][1], options.mesh.faces[i][2]));
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][0]][0], options.mesh.vertices[options.mesh.faces[i][0]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][1]][0], options.mesh.vertices[options.mesh.faces[i][1]][1]);
            chuller.addPoint(options.mesh.vertices[options.mesh.faces[i][2]][0], options.mesh.vertices[options.mesh.faces[i][2]][1]);
        }
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        var hullPoints = chuller.getHull();
        var lineGeo = new THREE.Geometry();
        for (var i = 0; i < hullPoints.length; i++) {
            //lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 5));
            lineGeo.vertices.push(new THREE.Vector3(hullPoints[i].x, hullPoints[i].y, 0.003 + options.mesh.vertices[0][2]));
        }
        var lineMat = new THREE.LineBasicMaterial({color: new THREE.Color(0,0,0), linewidth: 1});
        var line = new THREE.Line(lineGeo, lineMat);
        obj3.add(line);
    }

    var mat;
    if (options.shader === undefined) {
        mat = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: color, specular: 0x030303, shininess: 10, shading: THREE.SmoothShading} );
    } else {
        mat = new THREE.ShaderMaterial({
            vertexShader: document.getElementById(options.shader.vertexShader).textContent,
            fragmentShader: document.getElementById(options.shader.fragmentShader).textContent,
        });
    }

    var mesh = new THREE.Mesh( geo , mat );

    obj3.add(mesh);
    

    return obj3;

};

Renderer.prototype.addJoint = function(j) {

    var entity = {color: [255, 170, 0], getRadius: function() { return .06; }};
    var obj = this.addSphere(entity);

    this.scene.add(obj);
    this.joints[j.name] = {'object': obj, 'joint': j};
};

Renderer.prototype.addEntity = function(e, options) {
    
    var name = e.name;
    if (name in this.entities) {
        console.error('Cannot add entity. Entity with name ' + name + 'already exists.');
        return -1;
    }

    var obj;

    switch (e.getType()) {
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

    this.entities[e.name] = {'entity': e, 'object': obj};

};

module.exports = Renderer;
