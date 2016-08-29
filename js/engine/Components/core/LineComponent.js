export default (function(Component, Geometry) {

	function pow2(arg) {
        return Math.pow(arg, 2);
    };

    function distanceBetweenPoints(p1, p2) {
        return Math.sqrt(pow2(p2.x - p1.x) + pow2(p2.y - p1.y));
    };

	// CLASS LineComponent
	LineComponent.prototype = Object.create(Component.prototype);
	LineComponent.prototype.constructor = LineComponent;
    function LineComponent(tailPoseComponent, headPoseComponent, lineStyleTemplate, optionalLineCollisionParameters) {
		// inherits from
		Component.call(this);
		// private variables
		this.__tailPose = tailPoseComponent,
		this.__headPose = headPoseComponent,
        this.__style = lineStyleTemplate,
        this.__collisionParams = optionalLineCollisionParameters;
		// configure component
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
	};
	// private methods
	LineComponent.prototype.__onload = function() {
		this.__tailPose.addEventListener('onpositionchange', this, this.__onpositionchange);
		this.__tailPose.addEventListener('onorientationchange', this, this.__onorientationchange);
		this.__headPose.addEventListener('onpositionchange', this, this.__onpositionchange);
		this.__headPose.addEventListener('onorientationchange', this, this.__onorientationchange);
	};
	LineComponent.prototype.__onunload = function() {
		this.__tailPose.removeEventListener('onpositionchange', this, this.__onpositionchange);
		this.__tailPose.removeEventListener('onorientationchange', this, this.__onorientationchange);
		this.__headPose.removeEventListener('onpositionchange', this, this.__onpositionchange);
		this.__headPose.removeEventListener('onorientationchange', this, this.__onorientationchange);
	};
	LineComponent.prototype.__onpositionchange = function() {
		this.__fire('onpositionchange', this.position);
	};
	LineComponent.prototype.__onorientationchange = function() {
		this.__fire('onorientationchange', this.orientation);
	};
	LineComponent.prototype.__draw = function(ctx) {
		// draw line and apply styles
		var head = this.__headPose.position;
		var tail = this.__tailPose.position;
		var style = this.__style;
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(tail.x, tail.y);
		ctx.lineTo(head.x, head.y);
		ctx.strokeStyle = style.strokeStyle;
		ctx.lineWidth = style.lineWidth;
		ctx.stroke()
		ctx.restore();
	};
	// public prototypal variables
	Object.defineProperties(LineComponent.prototype, {
		'position': { // location of line's center
			get: function() {
				var head = this.__headPose.position;
				var tail = this.__tailPose.position;
				var x = (head.x + tail.x)/2;
				var y = (head.y + tail.y)/2;
				return new Geometry.Position(x, y);
			}
		},
		'orientation': { // heading from tail to head
			get: function() {
				var head = this.__headPose.position;
				var tail = this.__tailPose.position;
				var x = (head.x - tail.x)/2;
				var y = (head.y - tail.y)/2;
				if (x < 0) {
					return Math.PI + Math.atan(y/x);
				}
				return Math.atan(y/x);
			}
		},
		'length': { // euclidean distance from tail to head
			get: function() {
				return distanceBetweenPoints(this.__tailPose.position, this.__headPose.position);
			}
		},
		'mesh': { // line converted into static rectangular mesh
			get: function() {
				if (!this.__collisionParams) {
					throw new Error(this.constructor.name + ':get mesh - No LineCollisionParameters have been specified.');
				}
				var rectangle = new Geometry.Rectangle(
					this.length*this.__collisionParams.lengthModifier,
					this.__collisionParams.lineWidth
				);
				return new Geometry.Mesh(rectangle);
			}
		}
	});

	// events
    LineComponent.prototype.__implementEvents(
        'onpositionchange',
		'onorientationchange'
    );

	return LineComponent;

});