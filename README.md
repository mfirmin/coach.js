# coach.js
Coach, short for COntrolling Articulated CHarcters, is a simulation and rendering framework for controlling the motion of dynamically simulated rigid articulated characters.

Coach is built on top of the [Ammo.js](https://github.com/kripken/ammo.js/) dynamics simulation library, and uses [THREE.js](http://threejs.org/) for rendering.

For examples of coach in action, see [SimbiconJS](http://mfirmin.github.io/SimbiconJS)

Please note that Coach is currently in very early stages of development, so missing features and bugs are very likely. If you are interested in contributing to the development of Coach, feel free to send me an email at mcfirmin@gmail.com, or just clone/fork the repo and make a pull request!


## Install

Clone the library using

```
git clone git@github.com:mfirmin/coach.js.git
```

from the root folder, run ```Make``` to produce the file coach.js. Simply include this file in your webpage.

## Usage

Include the file coach.js on your webpage, which exposes the variable ```Coach``` in the global scope.

The example below will create a simple articulated pendulum.

See the wiki (coming soon!) for more detailed instructions on creating and controlling characters with coach.

### Create a World

To create a simulated world using Coach, first call

```
var world = new Coach.World({FPS: 1/30, dt: 0.0001}, '#simbicon');
```
Where the first argument is a javascript Object with entries
Make sure to call this only after the page is loaded (eg, wrap it in a $(document).ready handler)
```
FPS(float): frames per second to run the simulation at (default: 1/30)
dt(float):  stepsize to run the simulation at (default: 0.0001)
```
Note that a very small timestep (0.0001) is required for stable simulation of a physically realistic, 17-link humanoid. This runs at about 0.4 real time. If using simpler characters, you may be able to use larger stepsizes

The second argument to the World constructor is a string specifying the html element id (default: 'body').

### Add entities to the world

Next, construct entities as follows

```
var ground = new Coach.entities.Box('ground', [100,1,1], {mass: 0, color: [100,100,100]});
var link1  = new Coach.entities.Box('link1', [1, .1, .1], {mass: 1, color: [0,0,1]});
var link2  = new Coach.entities.Box('link2', [1, .1, .1], {mass: 1, color: [0,0,1]});
var link3  = new Coach.entities.Box('link2', [1, .1, .1], {mass: 1, color: [0,0,1]});
ground.setPosition([0.-.5,0]);
link1.setPosition([0,5,0]);
link2.setPosition([1,5,0]);
link3.setPosition([2,5,0]);
world.addEntity(ground);
world.addEntity(link1);
world.addEntity(link2);
world.addEntity(link3);
```
The Box constructor takes three arguments: a unique name, an array of 3 floats specifying the width, height, and depth of the box, and an optional Object with mass and RGB color entries. 

Objects with mass 0 will be static (other entities will collide with them, but they will not be affected by gravity, etc)

All entities are centered around (0,0,0) by default

Coach currently supports Box, Capsule, Cylinder, and Sphere elements.

### Add Joints

Next, we add joints between the links of the pendulum. Currently, only Hinge joints are supported.

```
var j1 = new Coach.joints.Hinge('joint1', {'A': 'link1', 'B': 'link2'}, [0.5,5,0], [0,0,1]);
var j2 = new Coach.joints.Hinge('joint2', {'A': 'link1', 'B': 'link2'}, [1.5,5,0], [0,0,1]);
world.addJoint(j1);
world.addJoint(j2);
```

Hinge Joints take 4 arguments: a unique string identifier, and Object identifying  the entities being joined together (where "A" is the first entity, and "B" the second), the initial position of the joint, and the rotation axis of the joint.

### Running the world

Finally, to begin the simulation, just call

``` 
world.go()
```
