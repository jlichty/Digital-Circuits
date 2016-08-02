export default (function(EventEmitter) {

    // CLASS System
    System.prototype = Object.create(EventEmitter.prototype);
    System.prototype.constructor = System;
    function System() {
        EventEmitter.call(this);
        this.__isPaused = false;
    };
    Object.defineProperties(System.prototype, {
		'isPaused': {
			get: function() {
				return this.__isPaused;
			}
		}
	});
    System.prototype.loopOnce = function(deltaMs) {
        if (this.isLoaded && !this.isPaused) {
            this.__fire('onframe', deltaMs);
            return true;
        }
        return false;
    };
    System.prototype.pause = function() {
        if (!this.__isPaused) {
            this.__isPaused = true;
            this.__fire('onpause');
        }
    };
    System.prototype.unpause = function() {
        if (this.__isPaused) {
            this.__isPaused = false;
            this.__fire('onunpause');
        }
    };
    System.prototype.restart = function() {
        this.unpause();
        this.reload();
    };

    // apply event mixins
    EventEmitter.Mixins.Loadable.call(System.prototype);
    
    // events
    System.prototype.__implementEvents(
        'onframe',
        'onpause',
        'onunpause'
    );

    return System;

});