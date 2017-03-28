import Entity from './entity';

class Sphere extends Entity {
    constructor(name, radius, opts) {
        super(name, opts);

        this._radius = radius;
    }

    initialize() {
        super.initialize();
    }

    get radius() {
        return this._radius;
    }

    set radius(r) {
        this._radius = r;
    }

    get type() {
        return this._type;
    }
}

export default Sphere;
