export default (function(engineInstancePromise, Controller) {

	var entityRepository;

    // receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        entityRepository = engine.entityRepository;
    });

	// CLASS SceneController
	SceneController.prototype = Object.create(Controller.prototype);
	SceneController.prototype.constructor = SceneController;
	function SceneController(entityRepository) {
		Controller.call(this);
		this.__scene = null;
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
	};
	SceneController.prototype.__onload = function() {
		if (this.__scene) {
			this.__scene.load();
		}
		entityRepository.addEventListener('onstore', this, this.addToCurrentScene);
	};
	SceneController.prototype.__onunload = function() {
		if (this.__scene) {
			this.__scene.unload();
		}
		entityRepository.removeEventListener('onstore', this, this.addToCurrentScene);
	};
	// public methods
	SceneController.prototype.setCurrentScene = function(scene) {
		if (this.__scene) {
			this.__scene.unload();
		}
		this.__scene = scene;
		this.__scene.load();
	};
	SceneController.prototype.addToCurrentScene = function(entity) {
		this.__scene.add(entity);
	};
	SceneController.prototype.removeFromCurrentScene = function(entity) {
		this.__scene.remove(entity);
	};

	return SceneController
	
});