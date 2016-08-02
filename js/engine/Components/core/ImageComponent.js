export default (function(Component, Geometry, PoseComponent) {
    
	// CLASS ImageComponent
	ImageComponent.prototype = Object.create(Component.prototype);
	ImageComponent.prototype.constructor = ImageComponent;
    function ImageComponent(image, imageStyleTemplate) {
		// inherits from
		Component.call(this);
		// private variables
		this.__image = image, this.__style = imageStyleTemplate;
	};
	// private methods
	ImageComponent.prototype.__draw = function(ctx) {
		var image = this.__image;
		var style = this.__style;
		var pose = this.__entity.getComponent(PoseComponent);
		var position = pose.position;
		var orientation = pose.orientation;
		ctx.save();
		ctx.translate(position.x, position.y);
		ctx.rotate(orientation);
		ctx.drawImage(image, style.sourceX, style.sourceY, style.sourceWidth, style.sourceHeight, -style.destWidth/2, -style.destHeight/2, style.destWidth, style.destHeight);
		ctx.restore();
	};
	// public prototypal variables
	Object.defineProperties(ImageComponent.prototype, {
		'width': {
			get: function() {
				return this.__style.width;
			}
		},
		'height': {
			get: function() {
				return this.__style.height;
			}
		},
		'mesh': {
			get: function() {
				var rectangle = new Geometry.Rectangle(this.width, this.height);
				return new Geometry.Mesh(rectangle);
			}
		}
	});

	return ImageComponent;

});