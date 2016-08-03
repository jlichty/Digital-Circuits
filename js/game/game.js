import {createEngineInstance} from '../engine/engine.js';
import assets from './assets.js';
import ui from './ui.js';
import lab from './lab.js';
import scenes from './scenes.js';
import tools from './tools.js';

export function createDigitalLogicGameInstance(canvas) { 

	// a promise that resolves with a live instance of the engine
	// used to resolve otherwise circular dependencies
	var fns = {};
	var engineInstancePromise = new Promise(function(resolve, reject) {
		fns.resolve = resolve;
		fns.reject = reject;
	});
	engineInstancePromise.resolve = fns.resolve;
	engineInstancePromise.reject = fns.reject;

	// engine (also sets engine.canvas)
	var engine = createEngineInstance(canvas);

	// namespaces
	engine.$.UI = ui(
		engine.$.Objects.Entity
	);
	engine.$.Lab = lab(
		engineInstancePromise,
		engine.$.Objects.Entity,
		engine.$.Components,
		engine.$.Data.Geometry,
		engine.$.Data.Graphics,
		engine.$.UI
	);
	
	// scenes
	engine.scenes = scenes(
		engineInstancePromise,
		engine.$.Objects.Scene,
		engine.$.UI,
		engine.$.Lab
	);

	// tools
	engine.tools = tools(
		engineInstancePromise,
		engine.$.Objects.Tool,
		engine.$.Components,
		engine.$.Data.Geometry,
		engine.$.UI,
		engine.$.Lab
	);

	// assets
	var assetMaps = assets(
		engine.$.Data.Graphics,
		engine.$.Lab
	);

	// resolve engine instance dependencies
	engineInstancePromise.resolve(engine);

	// load assets
	engine.assetLoader.load(assetMaps.imageMap, assetMaps.spriteMap).done(function() {
		engine.sceneController.setCurrentScene(engine.scenes.labScene);
		engine.toolController.equip(engine.tools.masterTool);
	});

	return engine;

};