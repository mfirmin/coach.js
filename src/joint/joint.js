class Joint {
    constructor(name, parent, child, opts = {}) {
        this._parent = parent;
        this._child = child;

        this.name = name;

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
}

export default Joint;
