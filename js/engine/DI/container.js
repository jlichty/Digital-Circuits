import Data from '../Data/catalogue.js';
import Objects from '../Objects/catalogue.js';
import Components from '../Components/catalogue.js';
import Loaders from '../Loaders/catalogue.js';
import Repositories from '../Repositories/catalogue.js';
import Systems from '../Systems/catalogue.js';
import Controllers from '../Controllers/catalogue.js';

export function generateIoCContainer() {

	// A 'synchronous' promise to be resolved with a live instance of engine
	// -- order of callback fulfillment is unimportant, but the native asynchronous Promise
	// object would not resolve callbacks immediately upon being fulfilled. The engine was
	// being loaded from external game files before internal engine objects had received the instance,
	// so methods relying on the engine instance were being called on undefined. The reason for this is still unclear.
	// SynchronousPromise has the advantage of behaving deterministically and 'immediately' upon being fulfilled.
	function SynchronousPromise() {
		this.__state = 'pending';
		this.__callbacks = [];
		this.__callbackParameter = null;
	};
	SynchronousPromise.prototype.__shiftCallbacks = function() {
		while (this.__callbacks.length > 0) {
			this.__callbacks.shift()(this.__callbackParameter);
		};
	};
	SynchronousPromise.prototype.resolve = function(callbackParameter) {
		if (this.__state === 'pending') {
			this.__state = 'fulfilled';
			this.__callbackParameter = callbackParameter;
			this.__shiftCallbacks();
		}
	};
	SynchronousPromise.prototype.reject = function(callbackParameter) {
		if (this.__state === 'pending') {
			this.__state = 'rejected';
			this.__callbackParameter = callbackParameter;
			this.__shiftCallbacks();
		}
	};
	SynchronousPromise.prototype.then = function(callback) {
		if (this.__state === 'pending') {
			this.__callbacks.push(callback);
			return;
		}
		this.__shiftCallbacks();
	};

	var engineInstancePromise = new SynchronousPromise();

    /* ***** CLASS OBJECT DEPENDENCY GRAPH ***** */
	// Catalogue files contain a set of anonymous 'injector' functions
	// that return a corresponding object/object namespace as an easy means
	// of dependency injection.

	var IoCContainer = {},
	$ = {}; // namespace container

	IoCContainer.engineInstancePromise = engineInstancePromise;
	IoCContainer.$ = $;
	
	$.Data = {};
	$.Objects = {};
	$.Components = {};
	$.Loaders = {};
	$.Repositories = {};
	$.Systems = {};
	$.Controllers = {};

	// Data
	$.Data.Geometry = Data.Geometry();
	$.Data.Graphics = Data.Graphics();
	$.Data.Physics = Data.Physics();

	// Objects
	
	// base
	$.Objects.AtomicLink = Objects.AtomicLink();
	$.Objects.AtomicArray = Objects.AtomicArray(
		$.Objects.AtomicLink
	);
	$.Objects.AtomicKeyPairArray = Objects.AtomicKeyPairArray(
		$.Objects.AtomicLink
	);
	
	// core
	$.Objects.EventEmitter = Objects.EventEmitter(
		engineInstancePromise,
		$.Objects.AtomicKeyPairArray
	);
	$.Objects.Loader = Objects.Loader();
	$.Objects.Tool = Objects.Tool();
	$.Objects.Component = Objects.Component(
		$.Objects.EventEmitter
	);
	$.Objects.Controller = Objects.Controller(
		$.Objects.EventEmitter
	);
	$.Objects.Entity = Objects.Entity(
		engineInstancePromise,
		$.Objects.EventEmitter,
		$.Objects.Component,
		$.Objects.AtomicArray
	);
	$.Objects.Repository = Objects.Repository(
		$.Objects.EventEmitter,
		$.Objects.AtomicArray
	);
	$.Objects.Scene = Objects.Scene(
		$.Objects.EventEmitter,
		$.Objects.Entity,
		$.Objects.AtomicArray
	);
	$.Objects.System = Objects.System(
		$.Objects.EventEmitter
	);

	// Components
	$.Components.CollidableComponent = Components.CollidableComponent(
		$.Objects.Component
	);
	$.Components.InputComponent = Components.InputComponent(
		$.Objects.Component
	);
	$.Components.MotionComponent = Components.MotionComponent(
		$.Objects.Component
	);
	$.Components.PoseComponent = Components.PoseComponent(
		$.Objects.Component,
		$.Data.Geometry
	);
	$.Components.ImageComponent = Components.ImageComponent(
		$.Objects.Component,
		$.Data.Geometry,
		$.Components.PoseComponent
	);
	$.Components.LineComponent = Components.LineComponent(
		$.Objects.Component,
		$.Data.Geometry
	);
	$.Components.MeshComponent = Components.MeshComponent(
		$.Objects.Component,
		$.Data.Geometry,
		$.Components.PoseComponent
	);
	$.Components.PickableComponent = Components.PickableComponent(
		engineInstancePromise,
		$.Objects.Component,
		$.Components.MeshComponent
	);
	$.Components.SpriteComponent = Components.SpriteComponent(
		$.Objects.Component,
		$.Data.Geometry,
		$.Components.PoseComponent
	);
	$.Components.DrawableComponent = Components.DrawableComponent(
		engineInstancePromise,
		$.Objects.Component,
		$.Components.LineComponent,
		$.Components.MeshComponent,
		$.Components.ImageComponent,
		$.Components.SpriteComponent
	);

	// Loaders
	$.Loaders.AssetLoader = Loaders.AssetLoader(
		$.Objects.Loader,
		$.Data.Graphics	
	);
	
	// Repositories
	$.Repositories.EntityRepository = Repositories.EntityRepository(
		$.Objects.Repository,
		$.Objects.Entity
	);
	$.Repositories.EventEmitterRepository = Repositories.EventEmitterRepository(
		$.Objects.Repository,
		$.Objects.EventEmitter
	);
	
	// Systems
	$.Systems.DrawSystem = Systems.DrawSystem(
		engineInstancePromise,
		$.Objects.System
	);
	$.Systems.InputSystem = Systems.InputSystem(
		engineInstancePromise,
		$.Objects.System,
		$.Data.Geometry
	);

	// Controllers
	$.Controllers.SceneController = Controllers.SceneController(
		engineInstancePromise,
		$.Objects.Controller
	);
	$.Controllers.ToolController = Controllers.ToolController(
		engineInstancePromise,
		$.Objects.Controller
	);

    return IoCContainer;

};