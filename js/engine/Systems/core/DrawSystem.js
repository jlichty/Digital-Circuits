export default (function(engineInstancePromise, System) {
	
	var canvas;

    // receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        canvas = engine.canvas;
    });

	// CLASS DrawSystem
	DrawSystem.prototype = Object.create(System.prototype);
	DrawSystem.prototype.constructor = DrawSystem;
	function DrawSystem() {
		System.call(this);
		this.addEventListener('onload', this, this.__onload);
		this.addEventListener('onunload', this, this.__onunload);
		this.addEventListener('onframe', this, this.__onframe);
	};
	DrawSystem.prototype.__onload = function() {
		window.addEventListener('onresize', this.__onresize);
	};
	DrawSystem.prototype.__onunload = function() {
		window.removeEventListener('onresize', this.__onresize);
	};
	DrawSystem.prototype.__onframe = function() {
		var ctx = canvas.getContext("2d");
		ctx.width = canvas.width = canvas.clientWidth;
		ctx.height = canvas.height = canvas.clientHeight;
		ctx.clearRect(0, 0, ctx.width, ctx.height);
		this.__fire('ondrawgamebackground', ctx);
		this.__fire('ondrawgameforeground', ctx);
		this.__fire('ondrawgameentities', ctx);
		this.__fire('ondrawuibackground', ctx);
		this.__fire('ondrawuiforeground', ctx);
		this.__fire('ondrawuientities', ctx);
		this.__fire('ondrawtoolicon', ctx);
	};
	DrawSystem.prototype.__onresize = function() {
		/*
		var ctx = canvas.getContext("2d");
		ctx.width = canvas.width = canvas.clientWidth;
		ctx.height = canvas.height = canvas.clientHeight;
		this.__fire();
		*/
	};

	// events
    DrawSystem.prototype.__implementEvents(
        'ondrawgamebackground',
		'ondrawgameforeground',
		'ondrawgameentities',
		'ondrawuibackground',
		'ondrawuiforeground',
		'ondrawuientities',
		'ondrawtoolicon'
    );

	// display layers
	DrawSystem.prototype.DISPLAYLAYERS = {
		GAMEBACKGROUND: 'ondrawgamebackground',
		GAMEFOREGROUND: 'ondrawgameforeground',
		GAMEENTITIES: 'ondrawgameentities',
		UIBACKGROUND: 'ondrawuibackground',
		UIFOREGROUND: 'ondrawuiforeground',
		UIENTITIES: 'ondrawuientities',
		TOOLICON: 'ondrawtoolicon'
	};

	return DrawSystem;
	
});