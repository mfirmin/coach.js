import Entity from './entity';

class Sphere extends Entity {
    constructor(radius, opts) {
        super(opts);

        this._radius = radius;
        this._type = 'SPHERE';
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
