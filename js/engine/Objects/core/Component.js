export default (function(EventEmitter) {

    // CLASS Component
    Component.prototype = Object.create(EventEmitter.prototype);
    Component.prototype.constructor = Component;
    function Component() {
        EventEmitter.call(this);
        // private variables
        this.__entity = null;
    };
    Component.prototype.injectEntity = function(entity) {
        if (!this.__entity) {
            this.__entity = entity;
            return true;
        }
        return false;
    };

    // apply event mixins
    EventEmitter.Mixins.Loadable.call(Component.prototype);
    EventEmitter.Mixins.Mortal.call(Component.prototype);

    return Component;

});