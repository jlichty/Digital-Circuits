export default (function(Component, Geometry, PoseComponent) {
    
	// CLASS SpriteComponent
	SpriteComponent.prototype = Object.create(Component.prototype);
	SpriteComponent.prototype.constructor = SpriteComponent;
    function SpriteComponent(sprite) {
		// inherits from
		Component.call(this);
		// private variables
		this.__sprite = sprite;
		this.__currentFrameIndex = 0;
	};
	// private methods
	SpriteComponent.prototype.__draw = function(ctx) {
		var currentFrame = this.__sprite.frames[this.__currentFrameIndex];
		var pose = this.__entity.getComponent(PoseComponent);
		var position = pose.position;
		var orientation = pose.orientation;
		var width = this.width;
		var height = this.height;
		ctx.save();
		ctx.translate(position.x, position.y);
		ctx.rotate(orientation);
		ctx.drawImage(currentFrame, -width/2, -height/2);
		ctx.restore();
	};
	// public prototypal variables
	Object.defineProperties(SpriteComponent.prototype, {
		'width': {
			get: function() {
				return this.__sprite.frames[this.__currentFrameIndex].width;
			}
		},
		'height': {
			get: function() {
				return this.__sprite.frames[this.__currentFrameIndex].height;
			}
		},
		'mesh': {
			get: function() {
				var rectangle = new Geometry.Rectangle(this.width, this.height);
				return new Geometry.Mesh(rectangle);
			}
		}
	});
	// public methods
	SpriteComponent.prototype.setFrame = function(frameNumber) {
		if (frameNumber < 0) {
			this.__currentFrameIndex = sprite.frames.length - 1;
		} else if (frameNumber < this.__sprite.frames.length) {
			this.__currentFrameIndex = frameNumber;
		} else {
			this.__currentFrameIndex = 0;
		}
		this.__fire('onframechange');
	};
	SpriteComponent.prototype.nextFrame = function() {
		this.setFrame(this.__currentFrameIndex + 1);
	};
	SpriteComponent.prototype.previousFrame = function() {
		this.setFrame(this.__currentFrameIndex - 1);
	};

	// events
    SpriteComponent.prototype.__implementEvents(
        'onframechange'
    );

	return SpriteComponent;

});