# coach.js
Coach, short for COntrolling Articulated CHarcters, is a simulation and rendering framework for controlling the motion of dynamically simulated rigid articulated characters.

Coach is built on top of the [Ammo.js](https://github.com/kripken/ammo.js/) dynamics simulation library, and uses [THREE.js](http://threejs.org/) for rendering.

For examples of coach in action, see [SimbiconJS](http://mfirmin.github.io/SimbiconJS)

Please note that Coach is currently in very early stages of development, so you are very likely to come across missing features and bugs. If you are interested in contributing to the development of Coach, feel free to send me an email at mcfirmin@gmail.com, or just clone/fork the repo and make a pull request!

## Usage

Include the file coach.js (found in static/coach.js) on your webpage, which exposes the variable ```Coach``` in the global scope.

In the following example, we create a simple articulated pendulum.

See the wiki (coming soon!) for more detailed instructions on creating and controlling characters with coach.

### Create a World

To create a simulated world using Coach, first call

```javascript
var world = new Coach.World({
  "FPS": 30, 
  "dt": 0.0001,
  "cameraOptions": {
    "type": "perspective",
    "position": [2,2,2],
    "target": [0,1,0],
  }
}, '#pendulum');
```
Where the first argument is a javascript Object with entries

- FPS(float): frames per second to render the simulation at (default: 30)
- dt(float):  stepsize to run the simulation at (default: 0.0002)

And, cameraOptions defining the camera to view the scene with. See the wiki for more detailed instructions

Note that a very small timestep (0.0002) is required for real-time, stable simulation of a physically realistic, 17-link humanoid. If using simpler characters, you may be able to use larger stepsizes

The second argument to the World constructor is a string specifying the html element id to add the WebGL Canvas to (default: 'body').

Make sure to call this only after the page is loaded (eg, wrap it in a $(document).ready handler)

### Add entities to the world

Next, construct entities as follows

```javascript
var ground = new Coach.entities.Box('ground', [100,1,1], {mass: 0, color: [100,100,100]});
var pivot  = new Coach.entities.Box('pivot', [0.1,0.1,0.1], {mass: 0, color: [255,0,0]});
var link1  = new Coach.entities.Box('link1', [0.5, 0.1, 0.1], {mass: 1, color: [0,255,0]});
var link2  = new Coach.entities.Box('link2', [0.5, 0.1, 0.1], {mass: 1, color: [0,0,255]});
var link3  = new Coach.entities.Box('link3', [0.5, 0.1, 0.1], {mass: 1, color: [0,255,255]});
ground.setPosition([0.,-0.5,0]);
pivot.setPosition([0,2,0]);
link1.setPosition([0.25,2,0]);
link2.setPosition([0.75,2,0]);
link3.setPosition([1.25,2,0]);
world.addEntity(ground);
world.addEntity(pivot);
world.addEntity(link1);
world.addEntity(link2);
world.addEntity(link3);
```
The Box constructor takes three arguments: a unique name, an array of 3 floats specifying the width, height, and depth of the box, and an optional Object with mass and RGB color entries. 

Objects with mass 0 will be static (other entities will collide with them, but they will not be affected by gravity, etc)

All entities are centered around (0,0,0) by default

Coach currently supports Box, Capsule, Cylinder, and Sphere elements.

### Add Joints

Next, we add joints between the links of the pendulum. Currently, hinge and ball joints are supported.

```javascript
var j0 = new Coach.joints.Ball('joint0', pivot, link1, [0,2,0], {
  "torqueScale": [0.1, 1.0, 1.0],
});
var j1 = new Coach.joints.Ball('joint1', link1, link2, [0.5,2,0], {
  "torqueScale": [0.1, 1.0, 1.0],
});
var j2 = new Coach.joints.Ball('joint2', link2, link3, [1.0,2,0], {
  "torqueScale": [0.1, 1.0, 1.0],
});
world.addJoint(j0);
world.addJoint(j1);
world.addJoint(j2);
```

Ball Joints take 5 arguments: a unique string identifier, the parent entity, the child entity, the initial position of the joint, and an optional options object. The "torqueScale" option is necessary to keep the simulation stable, after we add control in a later step.

Entities and Joints can also be bundled up as a __Character__, which can be stored in a JSON representation. See the wiki for more information about creating Characters (coming soon!).

### Start the simulation

Finally, to begin the simulation, just call

```javascript
world.go()
```

### Control

While Coach makes it easy to create simple passive simulations, its real power comes in controlling the simulation by manipulating joint torques.

Next, we will use a [Proportional Derivative (PD) Controller](https://en.wikipedia.org/wiki/PID_controller) in order to set the angle of the last joint at 90 degrees. The benefit of using a PD controller over simply setting joint angles is that the PD Controller produces a torque, which is fed into the physics engine itself, producing realistic motion.

```javascript
var pdc = new Coach.controllers.PDController3D(j1, {"X": 0, "Y": 0, "Z": 1.57});
var pdc2 = new Coach.controllers.PDController3D(j2, {"X": 0, "Y": 1.57, "Z": 0});

var simulationCallback = function(dt) {
  var torque = pdc.evaluate();
  j1.addTorque(torque);
  var torque2 = pdc2.evaluate();
  j2.addTorque(torque2);
};
```

Here, we specify a PD controller to bring joint 1 to 1.57 radians (90 degrees) about its local Z axis, and joint 2 about its Y axis. In a callback function, we evaluate the PD controller, and add the resulting torque to the joint. Finally, we update our existing world.go() function by passing in this callback as an argument. 

```javascript
world.go({"simulationCallback": simulationCallback});
```

The simulation will then apply the callback at every simulation step. Note that joint torques are reset to zero after each simulation step.

See the full example in action [here](http://mfirmin.github.io/coach.js/), and full code [here](https://github.com/mfirmin/coach.js/blob/gh-pages/index.html)
