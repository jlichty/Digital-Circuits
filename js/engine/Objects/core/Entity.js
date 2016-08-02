export default (function(engineInstancePromise, EventEmitter) {

    var entityRepository;

    // receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        entityRepository = engine.entityRepository;
    });

    // CLASS Entity
    Entity.prototype = Object.create(EventEmitter.prototype);
    Entity.prototype.constructor = Entity;
    function Entity() {
        // inherits from
        EventEmitter.call(this);
        // private variables
        this.__children = [];
        this.__components = [];
        // configure event methods
        this.addEventListener('onload', this, this.__onload);
        this.addEventListener('onunload', this, this.__onunload);
        this.addEventListener('ondestroy', this, this.__ondestroy);
        // store instance of entity
        entityRepository.store(this);
    };
    // private methods
    Entity.prototype.__onload = function() {
        // load components before loading children
        for (var i = 0, L = this.__components.length; i < L; i++) {
            this.__components[i].load();
        }
        for (var i = 0, L = this.__children.length; i < L; i++) {
            this.__children[i].load();
        }
    };
    Entity.prototype.__onunload = function() {
        // unload children before unloading components
        for (var i = 0, L = this.__children.length; i < L; i++) {
            this.__children[i].unload();
        }
        for (var i = 0, L = this.__components.length; i < L; i++) {
            this.__components[i].unload();
        }
    };
    Entity.prototype.__ondestroy = function() {
        // destroy all children
        for (var i = 0, L = this.__children.length; i < L; i++) {
            this.__children[i].destroy();
        }
        // purge components
        for (var i = 0, L = this.__components.length; i < L; i++) {
            this.__components[i].destroy();
        }
        entityRepository.release(this);
    };
    Entity.prototype.__indexOfComponent = function(component) {
        for (var i = 0, L = this.__components.length; i < L; i++) {
            if (this.__components[i].constructor.name === component.name) {
                return i;
            }
        }
        return -1;
    };
    // public methods
    Entity.prototype.addComponent = function(component) {
        if (this.hasComponent(component)) {
            throw new Error(this.constructor.name + ':addComponent - This entity already contains a ' + component.name + '.');
        }
        if (!component.injectEntity(this)) {
            throw new Error(this.constructor.name + ':addComponent - Component configuration error: ' + component.name + ' has been configured for another entity.');
        }
        this.__components.push(component);
        if (this.isLoaded) {
            this.reload();
        }
    };
    Entity.prototype.removeComponent = function(component) {
        if (this.hasComponent(component)) {
            this.__components.splice(this.__indexOfComponent(component), 1)[0].unload();
            if (this.isLoaded) {
                this.reload();
            }
        }
    };
    Entity.prototype.getComponent = function(component) {
        return this.__components[this.__indexOfComponent(component)];
    };
    Entity.prototype.hasComponent = function(component) {
        return this.getComponent(component) ? true : false;
    };
    Entity.prototype.addChild = function(childEntity) {
        if (!(childEntity instanceof Entity)) {
            throw new Error(this.constructor.name + ':addChild - Child must be an instance of Entity.');
        }
        this.__children.push(childEntity);
    };
    Entity.prototype.removeChild = function(childEntity) {
        var idx = this.__children.indexOf(childEntity);
        this.__children.splice(idx, 1);
    };
    Entity.prototype.hasChild = function(childEntity) {
        return this.__children.indexOf(childEntity) > -1 ? true : false;
    };

    // apply event mixins
    EventEmitter.Mixins.Loadable.call(Entity.prototype);
    EventEmitter.Mixins.Destructible.call(Entity.prototype);

    return Entity;

});