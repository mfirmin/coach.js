import Entity from './entity';

class Sphere extends Entity {
    init(name, radius, opts) {
        super(this, name, opts);

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
