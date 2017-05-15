/* global requestAnimationFrame, navigator, performance */
import Renderer  from '../renderer/renderer';
import Simulator from '../simulator/simulator';

class World {
    constructor(opts = {}, element) {
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

        const id = j.id;
        if (id in this.joints) {
            throw new Error(`Cannot add joint. Joint with id ${id} already exists.`);
        }

        if (render) {
            this.renderer.addJoint(j);
        }

        this.simulator.addJoint(j);

        this.joints[id] = j;
    }

    addEntity(e, opts = {}) {
        const render = (opts.render === undefined) ? true : opts.render;

        const simulate = (opts.simulate === undefined) ? true : opts.simulate;

        const id = e.id;
        if (id in this.entities) {
            throw new Error(`Cannot add entity. Entity with id ${id} already exists.`);
        }

        if (render) {
            this.renderer.addEntity(e, opts);
        }

        if (simulate) {
            this.simulator.addEntity(e);
        }

        this.entities[id] = e;

        e.world = this;
    }

    hasEntity(e) {
        return (e.id in this.entities && this.entities[e.id] === e);
    }

    hasJoint(j) {
        return (j.id in this.joints && this.joints[j.id] === j);
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
            if (!this.hasEntity(entity)) {
                this.addEntity(entity, eOpts);
            }
        }
        for (const joint of Object.values(character.joints)) {
            if (!this.hasJoint(joint)) {
                this.addJoint(joint);
            }
        }

        // eslint-disable-next-line no-param-reassign
        character.world = this;
    }

    updateEntity(id) {
        this.simulator.updateEntity(id);
    }

    go({ autoSimulate = true, simulationCallback, renderCallback }) {
        const scope = this;

        this.simulator.setCallback(simulationCallback);
        this.renderer.setCallback(renderCallback);

        let elapsed = 0;

        let last;

        const dtMS = scope.dt * 1000;

        // maximum time to simulate per frame. This limits elapsed time.
        // requestAnimationFrame will pause if the page is not shown (switched tabs etc),
        // so when we resume, elapsed time will be a massive number.
        // The choice of 16.66 corresponds to 60fps
        const MAX_SIMULATION_TIME_PER_FRAME = 16.66;

        let renderTime = 8;

        function animate(now) {
            elapsed = now - last;
            elapsed = Math.min(MAX_SIMULATION_TIME_PER_FRAME, elapsed);
            let simulationTime = 0;
            if (autoSimulate) {
                let realTime = performance.now() - now;
                while (simulationTime < elapsed && realTime < elapsed - (2 * renderTime)) {
                    scope.step();
                    simulationTime += dtMS;
                    realTime = performance.now() - now;
                }
            }

            if (scope.vrEnabled) {
                scope.renderer.camera.vrControls.update();
            }

            const renderStart = performance.now();
            scope.render(simulationTime / elapsed);
            renderTime = performance.now() - renderStart;

            last = now;

            if (scope.vrEnabled && scope.vrReady) {
                scope.vrDisplay.requestAnimationFrame(animate);
            } else {
                requestAnimationFrame(animate);
            }
        }
        last = performance.now();
        requestAnimationFrame(animate);
    }

    render(time) {
        this.renderer.render(time);
    }

    step() {
        this.simulator.step();
    }
}

export default World;
