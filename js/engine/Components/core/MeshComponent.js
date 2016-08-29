export default (function(Component, Geometry, PoseComponent) {

	// CLASS MeshComponent
	MeshComponent.prototype = Object.create(Component.prototype);
	MeshComponent.prototype.constructor = MeshComponent;
    function MeshComponent(mesh, optionalMeshStyleTemplate) {
		// inherits from
		Component.call(this);
		// private variables
		this.__mesh = mesh;
		this.__style = optionalMeshStyleTemplate;
		// configure component
		this.addEventListener('oninit', this, this.__oninit);
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
	};
	// private methods
	MeshComponent.prototype.__oninit = function() {
		// trigger mesh translation to current pose location
		this.mesh = this.__mesh;
	};
	MeshComponent.prototype.__onload = function() {
		var poseComponent = this.__entity.getComponent(PoseComponent);
		if (!poseComponent) {
			throw new Error(this.constructor.name + ':__onload - ' + this.__entity.constructor.name + ' does not contain a PoseComponent.');
		}
		poseComponent.addEventListener('onpositionchange', this, this.__translate);
		poseComponent.addEventListener('onorientationchange', this, this.__rotate);
	};
	MeshComponent.prototype.__onunload = function() {
		var poseComponent = this.__entity.getComponent(PoseComponent);
		poseComponent.removeEventListener('onpositionchange', this, this.__translate);
		poseComponent.removeEventListener('onorientationchange', this, this.__rotate);
	};
	MeshComponent.prototype.__draw = function(ctx) {
		var vertices = this.__mesh.vertices;
		var style = this.__style;
		if (!style) {
			return;
		}
		// draw mesh and apply styles
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(vertices[0].x, vertices[0].y);
		for (var i = 1, L = vertices.length; i < L; i++) {
			var vertex = vertices[i];
			ctx.lineTo(vertex.x, vertex.y);
		}
		ctx.closePath();
		ctx.strokeStyle = style.strokeStyle;
		ctx.lineWidth = style.lineWidth;
		ctx.stroke()
		if (style.fillStyle) {
			ctx.fillStyle = style.fillStyle;
			ctx.fill();
		}
		ctx.restore();
	};
	MeshComponent.prototype.__translate = function(newPosition, oldPosition) {
		var mesh = this.__mesh;
		for (var i = 0, L = mesh.vertices.length; i < L; i++) {
			mesh.vertices[i].x += (newPosition.x - oldPosition.x);
			mesh.vertices[i].y += (newPosition.y - oldPosition.y);
		};
	};
	MeshComponent.prototype.__rotate = function(newAngle) {
		var position = this.__entity.getComponent(PoseComponent).position;
		var mesh = this.__mesh;
		for (var i = 0, L = mesh.vertices.length; i < L; i++) {
			// find 'natural' vertex position relative to origin
			var templateX = mesh.template.vertices[i].x;
			var templateY = mesh.template.vertices[i].y;
			// perform new rotation
			var x = templateX*Math.cos(newAngle) - templateY*Math.sin(newAngle);
			var y = templateX*Math.sin(newAngle) + templateY*Math.cos(newAngle);
			// re-translate vertex back to current relative position
			mesh.vertices[i].x = position.x + x; 
			mesh.vertices[i].y = position.y + y;
		};
	};
	// public prototypal variables
	Object.defineProperties(MeshComponent.prototype, {
		'mesh': {
			get: function() {
				return this.__mesh;
			},
			set: function(mesh) {
				if (!(mesh instanceof Geometry.Mesh)) {
					throw new Error(this.constructor.name + ':mesh set - ' + mesh + ' is not an instance of Geometry.Mesh.');
				}
				this.__mesh = mesh;
				var poseComponent = this.__entity.getComponent(PoseComponent);
				this.__translate(poseComponent.position, new Geometry.Position(0, 0));
				this.__rotate(poseComponent.orientation);
			}
		},
		'style': {
			get: function() {
				return this.__style;
			},
			set: function(meshStyleTemplate) {
				this.__style = meshStyleTemplate;
			}
		}
	});
	// public methods
	MeshComponent.prototype.checkMeshCollision = function(mesh) {

	};
	MeshComponent.prototype.checkPointCollision = function(point) {
		// ray-casting algorithm based on
		// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

		var x = point.x, y = point.y, vs = this.__mesh.vertices;

		var isInside = false;
		for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			var xi = vs[i].x, yi = vs[i].y;
			var xj = vs[j].x, yj = vs[j].y;

			var intersect = ((yi > y) != (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) isInside = !isInside;
		}

		return isInside;
	};

	return MeshComponent;

});