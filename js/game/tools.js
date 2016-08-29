export default (function(engineInstancePromise, Tool, Components, Geometry, UI, Lab) {

	// ***** Tool Methods Template ***** 
	/* *********************************
	Tool.prototype.pickableEntityClassesList = [];
	Tool.prototype.equip = function(entity) {};
	Tool.prototype.discard = function() {};
	Tool.prototype.mousemove = function(cursor) {};
	Tool.prototype.mousedown = function(cursor) {};
	Tool.prototype.mouseup = function(cursor) {};
	Tool.prototype.click = function(cursor) {};
	Tool.prototype.keyup = function(keyCode) {};
	Tool.prototype.keydown = function(keyCode) {};
	Tool.prototype.mouseenter = function(entities) {};
	Tool.prototype.mousehover = function(entities) {};
	Tool.prototype.mouseleave = function(entities) {};
	*/

	var $ = {}, toolController;

    // receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        toolController = engine.toolController;
    });

	$.noTool = (function() {
		return new Tool();
	}());

	$.masterTool = (function() {
		var tool = new Tool();
		tool.pickableEntityClassesList = [Lab.ToolbarElement, Lab.CircuitElement, Lab.CircuitElementFeature];
		tool.mousedown = function() {
			var entity = resolveFirstPick(toolController.getPicks());
			if (!entity) {
				return;
			}
			// master tool does the picking
			var pickableComponent = entity.getComponent(Components.PickableComponent);
			pickableComponent.pick();
		};
		return tool;
	}());

	$.placingTool = (function() {
		var tool = new Tool();
		var equippedEntity, handlePosition;
		tool.pickableEntityClassesList = [UI.UIElement, Lab.CircuitDesignArea];
		tool.equip = function(entity) {
			if (!entity) {
				throw new Error('placingTool:equip - The entity to be placed must be defined.');
			}
			equippedEntity = entity;
			handlePosition = toolController.lastCursorPosition;
		};
		tool.mousemove = function(cursor) {
			var poseComponent = equippedEntity.getComponent(Components.PoseComponent)
			var position = poseComponent.position;
			poseComponent.position = new Geometry.Position(
				position.x + (cursor.x - handlePosition.x),
				position.y + (cursor.y - handlePosition.y)
			);
			handlePosition = cursor;
		};
		tool.mouseup = function() {
			var entity = resolveFirstPick(toolController.getPicks());
			if (entity instanceof UI.UIElement) {
				equippedEntity.destroy();
			}
			toolController.equip($.masterTool);
		};
		return tool;
	}());

	$.wireTool = (function() {
		var tool = new Tool();
		var toolHandle, intermediateWire, equippedTerminal;
		tool.pickableEntityClassesList = [Lab.Terminal];
		tool.equip = function(terminal) {
			if (!(terminal instanceof Lab.InputTerminal) && !(terminal instanceof Lab.OutputTerminal)) {
				throw new Error('wireTool:equip - ' + terminal + ' must be an instance of Lab.Terminal.');
			}
			equippedTerminal = terminal;
			if (terminal instanceof Lab.InputTerminal) {
				tool.pickableEntityClassesList = [Lab.OutputTerminal];
			}
			if (terminal instanceof Lab.OutputTerminal) {
				tool.pickableEntityClassesList = [Lab.InputTerminal];
			}
			// filter pickableEntityClasses for compatible terminals only
			toolController.reequip();
			// create wire between terminal and toolHandle
			var position = toolController.lastCursorPosition;
			toolHandle = new Lab.ToolHandle(position.x, position.y);
			toolHandle.create();
			intermediateWire = new Lab.Wire(terminal, toolHandle);
			intermediateWire.create();
			// select the terminal
			var pickableComponent = equippedTerminal.getComponent(Components.PickableComponent);
			pickableComponent.select();
		};
		tool.discard = function() {
			// deselect terminal
			var pickableComponent = equippedTerminal.getComponent(Components.PickableComponent);
			pickableComponent.deselect();
			// reset pickableEntityClasses to default compatibility
			tool.pickableEntityClassesList = [Lab.Terminal];
			// clean up the scene's entity space
			toolHandle.destroy();
			intermediateWire.destroy();
		};
		tool.mousemove = function(cursor) {
			var poseComponent = toolHandle.getComponent(Components.PoseComponent)
			poseComponent.position = new Geometry.Position(
				cursor.x,
				cursor.y
			);
		};
		tool.mouseup = function() {
			var entity = resolveFirstPick(toolController.getPicks());
			if (entity instanceof Lab.InputTerminal) {
				var wire = new Lab.Wire(equippedTerminal, entity);
				wire.create();
			}
			if (entity instanceof Lab.OutputTerminal) {
				var wire = new Lab.Wire(entity, equippedTerminal);
				wire.create();
			}
			toolController.equip($.masterTool);
		};
		return tool;
	}());

	$.cutterTool = (function() {
		var tool = new Tool();
		var icon, iconPoseComponent, iconSpriteComponent, offsetX = 27, offsetY = 32;
		var isInitialized = false, isFirstMouseUpSkipped = false;
		function init() {
			icon = new Lab.CutterIcon(0, 0);
			iconPoseComponent = icon.getComponent(Components.PoseComponent);
			iconSpriteComponent = icon.getComponent(Components.SpriteComponent);
			isInitialized = true;
		};
		tool.pickableEntityClassesList = [Lab.Wire];
		tool.equip = function() {
			if (!isInitialized) {
				init();
			}
			iconPoseComponent.position = new Geometry.Position(
				toolController.lastCursorPosition.x + offsetX,
				toolController.lastCursorPosition.y + offsetY
			);
			icon.load();
		};
		tool.discard = function() {
			icon.unload();
			isFirstMouseUpSkipped = false;
		};
		tool.mousemove = function(cursor) {
			iconPoseComponent.position = new Geometry.Position(
				cursor.x + offsetX,
				cursor.y + offsetY
			);
		};
		tool.mouseup = function() {
			if (!isFirstMouseUpSkipped) {
				isFirstMouseUpSkipped = true;
				return;
			}
			var wire = resolveFirstPick(toolController.getPicks());
			if (wire) {
				wire.destroy();
			} else {
				toolController.equip($.masterTool);
			}
		};
		tool.mouseenter = function() {
			iconSpriteComponent.nextFrame();
		};
		tool.mouseleave = function() {
			iconSpriteComponent.nextFrame();
		};
		return tool;
	}());

	$.trashTool = (function() {
		var tool = new Tool();
		var icon, iconPoseComponent, offsetX = 27, offsetY = 32;
		var isInitialized = false, isFirstMouseUpSkipped = false;;
		function init() {
			icon = new Lab.TrashcanIcon(0, 0);
			iconPoseComponent = icon.getComponent(Components.PoseComponent);
			isInitialized = true;
		};
		tool.pickableEntityClassesList = [Lab.CircuitElement];
		tool.equip = function() {
			if (!isInitialized) {
				init();
			}
			iconPoseComponent.position = new Geometry.Position(
				toolController.lastCursorPosition.x + offsetX,
				toolController.lastCursorPosition.y + offsetY
			);
			icon.load();
		};
		tool.discard = function() {
			icon.unload();
			isFirstMouseUpSkipped = false;
		};
		tool.mousemove = function(cursor) {
			iconPoseComponent.position = new Geometry.Position(
				cursor.x + offsetX,
				cursor.y + offsetY
			);
		};
		tool.mouseup = function() {
			if (!isFirstMouseUpSkipped) {
				isFirstMouseUpSkipped = true;
				return;
			}
			var circuitElement = resolveFirstPick(toolController.getPicks());
			if (circuitElement) {
				circuitElement.destroy();
			} else {
				toolController.equip($.masterTool);
			}
		};
		return tool;
	}());

	function resolveFirstPick(picks) {
		if (picks) {
			if (picks.length) {
				return picks[0];
			}
		}
		return null;
	};

	return $;

});