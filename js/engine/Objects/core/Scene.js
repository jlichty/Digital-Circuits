export default (function(EventEmitter, Entity, AtomicArray) {

    // CLASS Scene
    Scene.prototype = Object.create(EventEmitter.prototype);
    Scene.prototype.constructor = Scene;
	function Scene() {
        EventEmitter.call(this);
		// private variables
		this.__contents = new AtomicArray(Entity);
		// configure load events
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
	};
	// private methods
	Scene.prototype.__onload = function() {
		this.__contents.forEach(function(element) {
			element.load();
		});
	};
	Scene.prototype.__onunload = function() {
		this.__contents.forEach(function(element) {
			element.unload();
		});
	};
	// public methods
	Scene.prototype.add = function(element) {
		this.__contents.push(element);
		element.addEventListener('ondestroy', this, this.remove);
		if (this.isLoaded) {
			element.load();
		}
	};
	Scene.prototype.remove = function(element) {
		var removedElement = this.__contents.splice(element);
		if (removedElement) {
			removedElement.removeEventListener('ondestroy', this, this.remove);
		}
	};

	// apply event mixins
    EventEmitter.Mixins.Loadable.call(Scene.prototype);


	return Scene;

});