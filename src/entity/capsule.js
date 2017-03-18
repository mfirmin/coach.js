import Entity from './entity';

class Capsule extends Entity {
    init(name, radius, height, opts) {
        super(name, opts);

        this._radius = radius;
        this._height = height;
        this._type   = 'CAPSULE';
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

    get height() {
        return this._height;
    }

    set height(h) {
        this._height = h;
    }

    get type() {
        return this._type;
    }
}

export default Capsule;
