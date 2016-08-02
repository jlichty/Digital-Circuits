export default (function(engineInstancePromise, EventEmitter, Component, AtomicArray) {

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
        this.__children = new AtomicArray(Entity);
        this.__components = new AtomicArray(Component);
        // configure event methods
        this.addEventListener('onload', this, this.__onload);
        this.addEventListener('onunload', this, this.__onunload);
        this.addEventListener('ondestroy', this, this.__ondestroy);
        // store instance of entity
        entityRepository.store(this);
    };
    // private methods
    Entity.prototype.__validateNoDuplicateComponentNames = function(component) {
        this.__components.forEach(function(ownedComponent) {
            if (ownedComponent.constructor.name === component.constructor.name) {
                throw new Error(this.constructor.name + ':validateNoDuplicateComponentNames - This entity already contains a ' + component.name + '.');
            }
        }, this);
    };
    Entity.prototype.__onload = function() {
        // load components before loading children
        this.__components.forEach(function(component) {
            component.load();  
        });
        this.__children.forEach(function(child) {
            child.load();  
        });
    };
    Entity.prototype.__onunload = function() {
        // unload children before unloading components
        this.__children.forEach(function(child) {
            child.unload();  
        }, this);
        this.__components.forEach(function(component) {
            component.unload();  
        }, this);
    };
    Entity.prototype.__ondestroy = function() {
        // destroy children before destroying components
        this.__children.forEach(function(child) {
            child.destroy();  
        }, this);
        this.__components.forEach(function(component) {
            component.destroy();  
        }, this);
        entityRepository.release(this);
    };
    // public methods
    Entity.prototype.addComponent = function(component) {
        this.__validateNoDuplicateComponentNames(component);
        if (!component.injectEntity(this)) {
            throw new Error(this.constructor.name + ':addComponent - Component configuration error: ' + component.constructor.name + ' has been configured for another entity.');
        }
        this.__components.push(component);
        if (this.isLoaded) {
            this.reload();
        }
    };
    Entity.prototype.removeComponent = function(component) {
        var removedComponent = this.__components.splice(component);
        if (removedComponent) {
            removedComponent.destroy();
        };
    };
    Entity.prototype.getComponent = function(componentClass) {
        return this.__components.forEach(function(ownedComponent) {
            if (ownedComponent.constructor.name === componentClass.name) {
                return ownedComponent;
            }
        }, this);
    };
    Entity.prototype.hasComponent = function(componentClass) {
        return this.getComponent(componentClass) ? true : false;
    };
    Entity.prototype.addChild = function(childEntity) {
        this.__children.push(childEntity);
    };
    Entity.prototype.removeChild = function(childEntity) {
        var removedChild = this.__children.splice(childEntity);
        if (removedChild) {
            removedChild.destroy();
        };
    };
    Entity.prototype.hasChild = function(childEntity) {
        return this.__children.contains(childEntity);
    };

    // apply event mixins
    EventEmitter.Mixins.Loadable.call(Entity.prototype);
    EventEmitter.Mixins.Destructible.call(Entity.prototype);

    return Entity;

});