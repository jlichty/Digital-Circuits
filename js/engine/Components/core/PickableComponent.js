export default (function(engineInstancePromise, Component, MeshComponent) {
    
	var toolController;

	// receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        toolController = engine.toolController;
    });

	// CLASS PickableComponent
	PickableComponent.prototype = Object.create(Component.prototype);
	PickableComponent.prototype.constructor = PickableComponent;
    function PickableComponent() {
		// inherits from
		Component.call(this);
		// private variables
		this.__isEnabled = false;
		this.__isHovered = false;
		this.__isSelected = false;
		// configure component
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
	};
	// private methods
	PickableComponent.prototype.__onload = function() {
		toolController.addEventListener('onequip', this, this.__resolveToolCompatibility);
	};
	PickableComponent.prototype.__onunload = function() {
		toolController.removeEventListener('onequip', this, this.__resolveToolCompatibility);
		this.disable();
	};
	PickableComponent.prototype.__resolveToolCompatibility = function(compatibleEntityClassesArray) {
		if (compatibleEntityClassesArray.length == 0) {
			return this.enable();
		}
		for (var i = 0, L = compatibleEntityClassesArray.length; i < L; i++) {
			if (this.__entity instanceof compatibleEntityClassesArray[i]) {
				return this.enable();
			}
		}
		return this.disable();
	};
	PickableComponent.prototype.__onmousemove = function(cursor) {
		var meshComponent = this.__entity.getComponent(MeshComponent);
		if (!meshComponent) {
			throw new Error(this.constructor.name + ':pick - ' + this.__entity.constructor.name + ' does not contain a MeshComponent.');
		}
		if (meshComponent.checkPointCollision(cursor)) {
			this.__hover(); 
		} else {
			this.__unhover();
		}
	};
	PickableComponent.prototype.__signalGetPickOnPickable = function(cursor) {
		if (this.__isHovered) {
			toolController.signalGetPickOnPickable(this.__entity);
		}
	};
	PickableComponent.prototype.__hover = function() {
		if (!this.__isHovered) {
			this.__isHovered = true;
			this.__fire('onmouseenter');
			toolController.signalMouseEnterOnPickable(this.__entity);
		}
		this.__fire('onmousehover');
		toolController.signalMouseHoverOnPickable(this.__entity);
	};
	PickableComponent.prototype.__unhover = function() {
		if (this.__isHovered) {
			this.__isHovered = false;
			this.__fire('onmouseleave');
			toolController.signalMouseLeaveOnPickable(this.__entity);
		}
	};
	// public prototypal variables
	Object.defineProperties(PickableComponent.prototype, {
		'isEnabled': {
			get: function() {
				return this.__isEnabled;
			}
		},
		'isSelected': {
			get: function() {
				return this.__isSelected;
			}
		},
		'isHovered': {
			get: function() {
				return this.__isHovered;
			}
		}
	});
	// public methods
	PickableComponent.prototype.enable = function() {
		if (!this.__isEnabled) {
			this.__isEnabled = true;
			toolController.addEventListener('onmousemove', this, this.__onmousemove);
			toolController.addEventListener('ongetpicks', this, this.__signalGetPickOnPickable);
			this.__fire('onenable');
		}
	};
	PickableComponent.prototype.disable = function() {
		if (this.__isEnabled) {
			this.__isEnabled = false;
			toolController.removeEventListener('onmousemove', this, this.__onmousemove);
			toolController.removeEventListener('ongetpicks', this, this.__signalGetPickOnPickable);
			this.__unhover();
			this.__fire('ondisable');
		}
	};
	PickableComponent.prototype.pick = function() {
		this.__fire('onpick');
	};
	PickableComponent.prototype.select = function() {
		if (!this.__isSelected) {
			this.__isSelected = true;
			this.__fire('onselect');
		}
	};
	PickableComponent.prototype.deselect = function() {
		if (this.__isSelected) {
			this.__isSelected = false;
			this.__fire('ondeselect');
		}
	};

	// events
    PickableComponent.prototype.__implementEvents(
        'onenable',
		'ondisable',
		'onpick',
		'onselect',
		'ondeselect',
		'onmouseenter',
		'onmousehover',
		'onmouseleave'
    );

	return PickableComponent;

});