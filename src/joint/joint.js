class Joint {
    constructor(parent, child, opts = {}) {
        this.id = (opts.id) === undefined ? Joint.newID() : opts.id;

        this._parent = parent;
        this._child = child;

        this._world = null;

        this.initialize();
    }

    get parent() {
        return this._parent;
    }

    set parent(p) {
        this._parent = p;
    }

    get child() {
        return this._child;
    }

    set child(p) {
        this._child = p;
    }

    // eslint-disable-next-line class-methods-use-this
    initialize() { }

    get world() {
        return this._world;
    }

    set world(w) {
        this._world = w;
    }

    get character() {
        return this._character;
    }

    set character(c) {
        this._character = c;
    }

    static newID() {
        return Joint._idCount++;
    }
}

Joint._idCount = 0;

export default Joint;
