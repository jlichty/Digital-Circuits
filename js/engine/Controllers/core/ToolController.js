export default (function(engineInstancePromise, Controller, Tool) {
	
	var inputSystem;

    // receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        inputSystem = engine.inputSystem;
    });

	// CLASS ToolController
	ToolController.prototype = Object.create(Controller.prototype);
	ToolController.prototype.constructor = ToolController;
	function ToolController() {
		Controller.call(this);
		this.__entered = []; // mouseenter pickables list
        this.__hovered = []; // mousehover pickables list
        this.__left = []; // mouseleave pickables list
        this.__picks = [];
		this.__tool = new Tool();
		this.lastCursorPosition = null;
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
	};
	// private methods
	ToolController.prototype.__onload = function() {
		inputSystem.addEventListener('onmousemove', this, this.__onmousemove);
		inputSystem.addEventListener('onmousedown', this, this.__onmousedown);
		inputSystem.addEventListener('onmouseup', this, this.__onmouseup);
		inputSystem.addEventListener('onclick', this, this.__onclick);
		inputSystem.addEventListener('onkeydown', this, this.__onkeydown);
		inputSystem.addEventListener('onkeyup', this, this.__onkeyup);
	};
	ToolController.prototype.__onunload = function() {
		inputSystem.removeEventListener('onmousemove', this, this.__onmousemove);
		inputSystem.removeEventListener('onmousedown', this, this.__onmousedown);
		inputSystem.removeEventListener('onmouseup', this, this.__onmouseup);
		inputSystem.removeEventListener('onclick', this, this.__onclick);
		inputSystem.removeEventListener('onkeydown', this, this.__onkeydown);
		inputSystem.removeEventListener('onkeyup', this, this.__onkeyup);
	};
	ToolController.prototype.__onmousemove = function(cursor) {
		this.lastCursorPosition = cursor;
		this.__fire('onmousemove', cursor); // enqueues PickComponent event signals into __left, __hovered, __entered
		this.__tool.mousemove(cursor);
		if (this.__left.length > 0) {
			this.__tool.mouseleave(this.__left);
		}
		if (this.__hovered.length > 0) {
			this.__tool.mousehover(this.__hovered);
		}
		if (this.__entered.length > 0) {
			this.__tool.mouseenter(this.__entered);
		}
		this.__entered = [];
        this.__hovered = [];
        this.__left = [];
	};
	ToolController.prototype.__onmousedown = function(cursor) {
		this.__tool.mousedown(cursor);
	};
	ToolController.prototype.__onmouseup = function(cursor) {
		this.__tool.mouseup(cursor);
	};
	ToolController.prototype.__onclick = function(cursor) {
		this.__tool.click(cursor);
	};
	ToolController.prototype.__onkeydown = function(keyCode) {
		this.__tool.keydown(keyCode);
	};
	ToolController.prototype.__onkeyup = function(keyCode) {
		this.__tool.keyup(keyCode);
	};
	// public methods
	// accessed from tools file
	ToolController.prototype.equip = function(tool, entity) {
		if (this.__tool) {
			this.__tool.discard();
		}
		this.__tool = tool;
		this.__tool.equip(entity);
		this.__fire('onequip', this.__tool.pickableEntityClassesList);
		this.__entered = [];
        this.__hovered = [];
        this.__left = [];
	};
	ToolController.prototype.reequip = function() {
		this.__fire('onequip', this.__tool.pickableEntityClassesList);
	};
	ToolController.prototype.getPicks = function() {
		this.__fire('ongetpicks'); // enqueues pickables into __picks
		var picks = this.__picks;
		this.__picks = [];
		return picks;
	};
	// accessed from PickComponent
	ToolController.prototype.signalMouseEnterOnPickable = function(entity) {
		this.__entered.push(entity);
	};
    ToolController.prototype.signalMouseHoverOnPickable = function(entity) {
		this.__hovered.push(entity);
	};
    ToolController.prototype.signalMouseLeaveOnPickable = function(entity) {
		this.__left.push(entity);
	};
    ToolController.prototype.signalGetPickOnPickable = function(entity) {
        this.__picks.push(entity);
    };

	// events
    ToolController.prototype.__implementEvents(
        'onequip',
		'onmousemove',
		'ongetpicks'
    );

	return ToolController;

});