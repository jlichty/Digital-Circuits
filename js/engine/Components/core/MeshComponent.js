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
		ctx.fillStyle = style.fillStyle;
		ctx.fill();
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
		}
	});
	// public methods
	MeshComponent.prototype.checkMeshCollision = function(mesh) {

	};
	MeshComponent.prototype.checkPointCollision = function(point) {
		var mesh = this.__mesh;
		// find max/min x and y coordinates for a rectangle that bounds the entire mesh
		var firstVertex = mesh.vertices[0];
		var maxX = firstVertex.x, minX = firstVertex.x, maxY = firstVertex.y, minY = firstVertex.y;
		for (var i = 1, L = mesh.vertices.length; i < L; i++) {
			var vertex = mesh.vertices[i];
			if (maxX < vertex.x) {
				maxX = vertex.x;
			}
			if (minX > vertex.x) {
				minX = vertex.x;
			}
			if (maxY < vertex.y) {
				maxY = vertex.y;
			}
			if (minY > vertex.y) {
				minY = vertex.y;
			}
		}
		// check if we're inside bounding rectangle
		if (point.x < maxX && point.x > minX && point.y < maxY && point.y > minY) {
			// trace ray from point to (minX, minY) and from point to (maxX, maxY)
			// if the number of intersections between a ray and the mesh's sides is odd --> collision detected
			/*
			var sides = [];
			for (var i = 0, L = mesh.vertices.length - 1; i < L; i++) {
				sides
			}
			*/
			return true;
		}
		return false;
	};

	return MeshComponent;

});