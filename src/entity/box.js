import Entity from './entity';

class Box extends Entity {
    constructor(sides, opts) {
        super(opts);

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
