export default (function(EventEmitter) {

    // CLASS Controller
    Controller.prototype = Object.create(EventEmitter.prototype);
    Controller.prototype.constructor = Controller;
    function Controller() {
        EventEmitter.call(this);
    };

    // apply event mixins
    EventEmitter.Mixins.Loadable.call(Controller.prototype);
    
    return Controller;

});