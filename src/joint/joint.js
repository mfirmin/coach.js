class Joint {
    constructor(parent, child, opts = {}) {
        this.id = (opts.id) === undefined ? Joint.newID() : opts.id;

        this._parent = parent;
        this._child = child;

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

    static newID() {
        return Joint._idCount++;
    }
}

Joint._idCount = 0;

export default Joint;
