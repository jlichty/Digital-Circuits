import {generateIoCContainer} from './DI/container.js';

export function createEngineInstance(canvas) {
	
	var IoCContainer = generateIoCContainer();
	var $ = IoCContainer.$;

	// CLASS Engine
	Engine.prototype = Object.create($.Objects.System.prototype);
    Engine.prototype.constructor = Engine;
	function Engine(canvas) {
		$.Objects.System.call(this);
		this.$ = $;
		this.canvas = canvas;
		this.__isLoaded = false;
		this.__isPaused = false;
		this.__systems = [];
		this.__controllers = [];
		// configure engine
		this.__registerLoaders();
		this.__registerRepositories();
		this.__registerSystems();
		this.__registerControllers();
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
		this.addEventListener('onframe', this, this.__onframe);
		this.addEventListener('onpause', this, this.__onpause);
		this.addEventListener('onunpause', this, this.__onunpause);
	};
	// private methods
	Engine.prototype.__onload = function() {
		for (var i = 0, L = this.__systems.length; i < L; i++) {
			this.__systems[i].load();
		}
		for (var i = 0, L = this.__controllers.length; i < L; i++) {
			this.__controllers[i].load();
		}
	};
	Engine.prototype.__onunload = function() {
		for (var i = 0, L = this.__systems.length; i < L; i++) {
			this.__systems[i].unload();
		}
		for (var i = 0, L = this.__controllers.length; i < L; i++) {
			this.__controllers[i].unload();
		}
	};
	Engine.prototype.__onframe = function(deltaMs) {
		for (var i = 0, L = this.__systems.length; i < L; i++) {
			this.__systems[i].loopOnce(deltaMs);
		}
	};
	Engine.prototype.__onpause = function() {
		for (var i = 0, L = this.__systems.length; i < L; i++) {
			this.__systems[i].pause();
		}
	};
	Engine.prototype.__onunpause = function() {
		for (var i = 0, L = this.__systems.length; i < L; i++) {
			this.__systems[i].unpause();
		}
		this.start;
	};
	Engine.prototype.__registerLoaders = function() {
		this.assetLoader = new $.Loaders.AssetLoader();
	};
	Engine.prototype.__registerRepositories = function() {
		this.entityRepository = new $.Repositories.EntityRepository();
		this.eventEmitterRepository = new $.Repositories.EventEmitterRepository();
	};
	Engine.prototype.__registerSystems = function() {
		this.inputSystem = new $.Systems.InputSystem();
		this.__systems.push(this.inputSystem);
		this.drawSystem = new $.Systems.DrawSystem();
		this.__systems.push(this.drawSystem);
	};
	Engine.prototype.__registerControllers = function() {
		this.sceneController = new $.Controllers.SceneController();
		this.__controllers.push(this.sceneController);
		this.toolController = new $.Controllers.ToolController();
		this.__controllers.push(this.toolController);
	};
	Engine.prototype.__beginMainLoop = function() {
		var self = this;
		var running = true, lastFrame = +new Date;
		var	raf = requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			function (callback) {
				return window.setTimeout(callback, 1000 / 60);
			};
		function loop(now) {
			// stop the loop if loopOnce returned false
			if (running) {
				raf(loop);
				var deltaMs = now - lastFrame;
				if (deltaMs < 2000) {
					running = self.loopOnce(deltaMs);
				}
				lastFrame = now;
			}
		};
		loop(lastFrame);
	};
	// public methods
	Engine.prototype.start = function() {
		if (!this.isLoaded) {
			this.load();
		}
		this.__beginMainLoop();
	};

	var engine = new Engine(canvas);

	// resolve engine instance dependencies now that the engine has been instantiated
	IoCContainer.engineInstancePromise.resolve(engine);

	return engine;

};