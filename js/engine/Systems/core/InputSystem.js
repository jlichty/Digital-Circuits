export default (function(engineInstancePromise, System, Geometry) {

	var canvas;

    // receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        canvas = engine.canvas;
    });

	function InputQueue(inputSystem) {
		var system = inputSystem;
		var queue = [];
		var isExecuting = false;
		function process() {
			if (isExecuting) {
				return;
			}
			isExecuting = true;
			while (queue.length > 0) {
				var input = queue.shift();
				system.__fire(input.event, input.message);
			}
			isExecuting = false;
		};
		return {
			push: function(event, message) {
				queue.push({event: event, message: message});
			},
			process: process
		};
	};

	// CLASS InputSystem
	InputSystem.prototype = Object.create(System.prototype);
	InputSystem.prototype.constructor = InputSystem;
	function InputSystem() {
		System.call(this);
		this.__inputQueue = new InputQueue(this);
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
		this.addEventListener('onframe', this, this.__onframe);
	};
	InputSystem.prototype.__onload = function() {
		canvas.onmousemove = this.__onmousemove.bind(this);
		canvas.onmousedown = this.__onmousedown.bind(this);
		canvas.onmouseup = this.__onmouseup.bind(this);
		canvas.onclick = this.__onclick.bind(this);
		window.onkeydown = this.__onkeydown.bind(this);
		window.onkeyup = this.__onkeyup.bind(this);
	};
	InputSystem.prototype.__onunload = function() {
		canvas.onmousemove = null;
		canvas.onmousedown = null;
		canvas.onmouseup = null;
		canvas.onclick = null;
		window.onkeydown = null;
		window.onkeyup = null;
	};
	InputSystem.prototype.__onframe = function() {
		this.__inputQueue.process();
	};
	InputSystem.prototype.__onmousemove = function(e) {
		var mouseX, mouseY;
		if (e.offsetX) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		} else if (e.layerX) {
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
		this.__inputQueue.push('onmousemove', new Geometry.Position(mouseX, mouseY));
	};
	InputSystem.prototype.__onmousedown = function(e) {
		var mouseX, mouseY;
		if (e.offsetX) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		} else if (e.layerX) {
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
		this.__inputQueue.push('onmousedown', new Geometry.Position(mouseX, mouseY));
	};
	InputSystem.prototype.__onmouseup = function(e) {
		var mouseX, mouseY;
		if (e.offsetX) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		} else if (e.layerX) {
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
		this.__inputQueue.push('onmouseup', new Geometry.Position(mouseX, mouseY));
	};
	InputSystem.prototype.__onclick = function(e) {
		var mouseX, mouseY;
		if (e.offsetX) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		} else if (e.layerX) {
			mouseX = e.layerX;
			mouseY = e.layerY;
		}
		this.__inputQueue.push('onclick', new Geometry.Position(mouseX, mouseY));
	};
	InputSystem.prototype.__onkeydown = function(e) {
		this.__inputQueue.push('onkeydown', e.keyCode);
	};

	InputSystem.prototype.__onkeyup = function(e) {
		this.__inputQueue.push('onkeyup', e.keyCode);
	};

	// events
    InputSystem.prototype.__implementEvents(
        'onmousemove',
		'onmousedown',
		'onmouseup',
		'onclick',
		'onkeydown',
		'onkeyup'
    );

	return InputSystem;

});

