export default (function(EventEmitter, Entity) {

    // CLASS Scene
    Scene.prototype = Object.create(EventEmitter.prototype);
    Scene.prototype.constructor = Scene;
	function Scene() {
        EventEmitter.call(this);
		// private variables
		this.__contents = [];
		// configure load events
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
	};
	// private methods
	Scene.prototype.__onload = function() {
		for (var i = 0, L = this.__contents.length; i < L; i++) {
			this.__contents[i].load();
		}
	};
	Scene.prototype.__onunload = function() {
		for (var i = 0, L = this.__contents.length; i < L; i++) {
			this.__contents[i].unload();
		}
	};
	// public methods
	Scene.prototype.add = function(/* entity1, entity2, entity3, etc... */) {
		for (var i = 0, L = arguments.length; i < L; i++) {
			var entity = arguments[i];
			if (!(entity instanceof Entity)) {
				throw new Error(this.constructor.name + ':add - Objects to be added must be an instance of Entity.');
			}
			this.__contents.push(entity);
			entity.addEventListener('ondestroy', this, this.remove);
			if (this.isLoaded) {
				entity.load();
			}
		}
	};
	Scene.prototype.remove = function(/* entity1, entity2, entity3, etc... */) {
		for (var i = 0, L = arguments.length; i < L; i++) {
			var idx = this.__contents.indexOf(arguments[i]);
			if (idx > -1) {
				var entity = this.__contents.splice(idx, 1)[0];
				entity.removeEventListener('ondestroy', this, this.remove);
			}
		}
	};

	// apply event mixins
    EventEmitter.Mixins.Loadable.call(Scene.prototype);


	return Scene;

});