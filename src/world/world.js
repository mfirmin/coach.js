/* global requestAnimationFrame, navigator, performance */
import Renderer  from '../renderer/renderer';
import Simulator from '../simulator/simulator';

class World {
    constructor(opts = {}, element) {
        this.FPS = (opts.FPS === undefined) ? 30.0 : opts.FPS;
        this.dt  = (opts.dt === undefined) ? 0.0001 : opts.dt;
        this.is2D = (opts['2D'] === undefined) ? false : opts['2D'];

        this.vrEnabled = (opts.VR === undefined) ? false : opts.VR;

        if (this.vrEnabled) {
            this.vrReady = false;
            // eslint-disable-next-line no-param-reassign
            navigator.getVRDisplays().then((displays) => {
                if (displays.length > 0) {
                    this.vrDisplay = displays[0];
                    if (this.vrDisplay.stageParameters) {
//                        this.setupVR(this.vrDisplay.stageParameters);
                        this.vrReady = true;
                    }
                    if (opts.vrReadyCallback) {
                        opts.vrReadyCallback(this.vrDisplay);
                    }
                }
            });
        }

        this.renderer = new Renderer({
            cameraOptions: opts.cameraOptions,
            VR:            this.vrEnabled,
        }, element);

        this.simulator = new Simulator(this.dt, { '2D': this.is2D });

        this.entities = {};
        this.joints   = {};
        this.characters = {};
    }

    addJoint(j, opts = {}) {
        const render = (opts.render === undefined) ? false : opts.render;

        const name = j.name;
        if (name in this.entities) {
            throw new Error(`Cannot add entity. Entity with name ${name} already exists.`);
        }

        if (render) {
            this.renderer.addJoint(j);
        }

        this.simulator.addJoint(j);

        this.joints[name] = j;
    }

    addEntity(e, opts = {}) {
        const render = (opts.render === undefined) ? true : opts.render;

        const simulate = (opts.simulate === undefined) ? true : opts.simulate;

        const name = e.name;
        if (name in this.entities) {
            throw new Error(`Cannot add entity. Entity with name ${name}already exists.`);
        }

        if (render) {
            this.renderer.addEntity(e, opts);
        }

        if (simulate) {
            this.simulator.addEntity(e);
        }

        this.entities[name] = e;
    }

    addCharacter(character, opts = {}) {
        for (const [fullname, entity] of Object.entries(character.entities)) {
            const name = fullname.slice(fullname.indexOf('.') + 1);
            const eOpts = {};
            if (opts !== undefined && opts.meshOverlay !== undefined) {
                const mesh = {
                    faces:    opts.meshOverlay[name].faces,
                    vertices: opts.meshOverlay[name].vertices,
                    color:    opts.meshOverlay[name].color,
                };
                eOpts.mesh = mesh;
            }
            this.addEntity(entity, eOpts);
        }
        for (const joint of Object.values(character.joints)) {
            this.addJoint(joint);
        }
    }

    go(opts = {}) {
        const scope = this;

        this.simulator.setCallback(opts.simulationCallback);
        this.renderer.setCallback(opts.renderCallback);

        let elapsed = 0;

        let last = performance.now();

        const dtMS = scope.dt * 1000;

        let renderTime = 1000;

        function animate(now) {
            elapsed = now - last;
            let time = 0;
            let realTime = performance.now() - now;
            while (time < elapsed && realTime < elapsed - (2 * renderTime)) {
                scope.step();
                time += dtMS;
                realTime = performance.now() - now;
            }

            if (scope.vrEnabled) {
                scope.renderer.camera.vrControls.update();
            }

            const renderStart = performance.now();
            scope.render(time / elapsed);
            renderTime = performance.now() - renderStart;

            last = now;

            if (scope.vrEnabled && scope.vrReady) {
                scope.vrDisplay.requestAnimationFrame(animate);
            } else {
                requestAnimationFrame(animate);
            }
        }

        animate();
    }

    render(time) {
        this.renderer.render(time);
    }

    step() {
        this.simulator.step();
    }
}

export default World;
