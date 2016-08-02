export default (function(engineInstancePromise, Component, LineComponent, MeshComponent, ImageComponent, SpriteComponent) {

	var drawSystem;

	// receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        drawSystem = engine.drawSystem;
    });

	// CLASS DrawableComponent
	DrawableComponent.prototype = Object.create(Component.prototype);
	DrawableComponent.prototype.constructor = DrawableComponent;
    function DrawableComponent(displayLayer) {
		// inherits from
		Component.call(this);
		// private variables
		this.__displayLayer = displayLayer;
		this.__isVisible = false;
		// configure component
		this.addEventListener('onload', this, this.show);
		this.addEventListener('onunload', this, this.hide);
	};
	// private methods
	DrawableComponent.prototype.__draw = function(ctx) {
		// extract components with draw methods and draw them
		var lineComponent = this.__entity.getComponent(LineComponent);
		var meshComponent = this.__entity.getComponent(MeshComponent);
		var imageComponent = this.__entity.getComponent(ImageComponent);
		var spriteComponent = this.__entity.getComponent(SpriteComponent);
		if (!lineComponent && !meshComponent && !imageComponent && !spriteComponent) {
			throw new Error(this.constructor.name + ':draw - ' + this.__entity.constructor.name + ' does not contain any drawable components.');
		}
		if (lineComponent) {
			lineComponent.__draw(ctx);
		}
		if (meshComponent) {
			meshComponent.__draw(ctx);
		}
		if (imageComponent) {
			imageComponent.__draw(ctx);
		}
		if (spriteComponent) {
			spriteComponent.__draw(ctx);
		}
	};
	// public prototypal variables
	Object.defineProperties(DrawableComponent.prototype, {
		'isVisible': {
			get: function() {
				return this.__isVisible;
			}
		}
	});
	// public methods
	DrawableComponent.prototype.show = function() {
		if (!this.__isVisible) {
			this.__isVisible = true;
			drawSystem.addEventListener(this.__displayLayer, this, this.__draw);
			this.__fire('onshow');
		}
	};
	DrawableComponent.prototype.hide = function() {
		if (this.__isVisible) {
			this.__isVisible = false;
			drawSystem.removeEventListener(this.__displayLayer, this, this.__draw);
			this.__fire('onhide');
		}
	};

	// events
    DrawableComponent.prototype.__implementEvents(
        'onshow',
        'onhide'
    );

	return DrawableComponent;

});