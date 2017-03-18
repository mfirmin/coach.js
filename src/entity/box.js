import Entity from './entity';

class Box extends Entity {
    init(name, sides, opts) {
        super(name, opts);

        this._sides = sides;
        this._type  = 'BOX';
    }

    initialize() {
        super.initialize();
    }

    get sides() {
        return this._sides;
    }

    set sides(s) {
        this._sides = s;
    }

    get type() {
        return this._type;
    }
}

export default Box;
