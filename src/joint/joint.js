function Joint(name, parent, child, opts) {

    this.opts = (opts === undefined) ? {} : opts;

    this.parent = parent;
    this.child = child;

    this.name = name;

    this.initialize();
}

Joint.prototype.constructor = Joint;

Joint.prototype.initialize = function() {
};

module.exports = Joint;
