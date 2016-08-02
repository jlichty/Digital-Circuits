export default (function() {

    // CLASS Loader
    function Loader() {
        // private variables
        this.__isFinishedLoading = false;
        this.__callbacks = [];
        this.__loadTotal = 0;
        this.__loadCounter = 0;
    };
    // private methods
    Loader.prototype.__itemFinishedLoading = function(){
        this.__loadCounter++;
        if (this.__loadCounter == this.__loadTotal) {
            this.__isFinishedLoading = true;
            this.__loadTotal = 0;
            this.__loadCounter = 0;
            while(this.__callbacks.length > 0) {
                this.__callbacks.shift()();
            }
        }
    };
    Loader.prototype.__itemFinishedLoadingWithError = function(){
        throw new Error(this + ' failed to load.');
    };
    // public prototypal variables
    Object.defineProperties(Loader.prototype, {
		'isFinishedLoading': {
			get: function() {
				return this.__isFinishedLoading;
			}
		}
	});
    Loader.prototype.load = function() {
        this.__isFinishedLoading = false;
    };
    Loader.prototype.done = function(callback) {
        if (this.__isFinishedLoading) {
            return callback();
        }
        this.__callbacks.push(callback);
    };

    return Loader;

});