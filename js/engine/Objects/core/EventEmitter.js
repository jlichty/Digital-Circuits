export default (function(engineInstancePromise, AtomicKeyPairArray) {

    var eventEmitterRepository;

    // receive a live instance of engine
    engineInstancePromise.then(function(engine) {
        eventEmitterRepository = engine.eventEmitterRepository;
    });

    // CLASS EventEmitter
    function EventEmitter() {
        // private variables
        this.__events = {};
        // This is a special case where properties of the live engine instance rely on EventEmitter.
        // In order to store these instances we must await instantiation of the EventEmitter repository
        engineInstancePromise.then((function() {
            // don't store the eventEmitterRepository as a member of itself!
            if (this !== eventEmitterRepository) {
                eventEmitterRepository.store(this);
            }
        }).bind(this));
    };
    // private prototypal variables
    EventEmitter.prototype.__eventList = [];
    // private methods
    EventEmitter.prototype.__validateEventIsImplemented = function(event) {
        if (!this.hasEvent(event)) {
            throw new Error(this.constructor.name + ':validateEventIsImplemented - ' + event + ' event is not implemented.');
        }
    };
    EventEmitter.prototype.__validateSubscriber = function(subscriber) {
        if (!subscriber) {
            throw new Error(this.constructor.name + ':validateSubscriber - ' + ' A subscriber object must be supplied.');
        }
        if (Object.getOwnPropertyNames(subscriber).length === 0) {
            throw new Error(this.constructor.name + ':validateSubscriber - ' + ' Subscribers cannot be empty objects.');
        }
    };
    EventEmitter.prototype.__validateCallback = function(callback) {
        if (typeof callback !== 'function') {
            throw new Error(this.constructor.name + ':validateCallback - ' + ' A callback must be supplied as a function.');
        }
    };
    EventEmitter.prototype.__implementEvents = function(/* event1, event2, etc. */) {
        for (var i = 0, L = arguments.length; i < L; i++) {
            var event = arguments[i];
            if (this.hasEvent(event)) {
                throw new Error(this.constructor.name + ':implementEvents - ' + event + ' has already been implemented.');
            }
            this.__eventList = this.__eventList.concat(event);
        }
    };
    EventEmitter.prototype.__fire = function(event /*, argument1, argument2, etc... */) {
        this.__validateEventIsImplemented(event);
        if (this.__events[event]) {
            var args = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1, arguments.length) : null;
            this.__events[event].forEach(function(subscriber, callback) {
                callback.apply(subscriber, args);
            });
        }
    };
    // public methods
    EventEmitter.prototype.addEventListener = function(event, subscriber, callback) {
        this.__validateEventIsImplemented(event);
        this.__validateSubscriber(subscriber);
        this.__validateCallback(callback);
        if (!this.__events[event]) {
            this.__events[event] = new AtomicKeyPairArray();
        }
        this.__events[event].push(subscriber, callback);
    };
    EventEmitter.prototype.removeEventListener = function(event, subscriber, callback) {
        this.__validateEventIsImplemented(event);
        this.__validateSubscriber(subscriber);
        this.__validateCallback(callback);
        this.__events[event].splice(subscriber, callback);
    };
    EventEmitter.prototype.purgeEventListenersBoundTo = function(subscriber) {
        this.__validateSubscriber(subscriber);
        for (var event in this.__events) {
            if (this.__events.hasOwnProperty(event)) {
                this.__events[event].purgeEntriesWithKey(subscriber);
            }
        }
    };
    EventEmitter.prototype.hasEvent = function(event) {
        return this.__eventList.indexOf(event) > -1 ? true : false;
    };

    // mixins
    function Destructible(ClassPrototype) {
        var target = ClassPrototype || this;
        if (!(target instanceof EventEmitter)) {
            throw new Error(Destructible.name + ':constructor - Target must be an instance of EventEmitter');
        }
        target.__isDestroyed = false;
        Object.defineProperties(target, {
            'isDestructible': {
                get: function() {
                    return true;
                }
            },
            'isDestroyed': {
                get: function() {
                    return this.__isDestroyed;
                }
            }
        });
        target.create = Destructible.prototype.create;
        target.destroy = Destructible.prototype.destroy;
        target.__implementEvents(
            'ondestroy'
        );
    };
    Destructible.prototype.destroy = function() {
        if (!this.__isDestroyed) {
            this.__isDestroyed = true
            this.__fire('ondestroy', this);
            if (this.isLoaded) {
                this.unload();
            }
            eventEmitterRepository.release(this);
            eventEmitterRepository.purgeEventListenersBoundTo(this);
        }
    };

    function Loadable(ClassPrototype) {
        var target = ClassPrototype || this;
        if (!(target instanceof EventEmitter)) {
            throw new Error(Loadable.name + ':constructor - Target must be an instance of EventEmitter');
        }
        target.__isLoaded = false;
        target.__isInitialized = false;
        Object.defineProperties(target, {
            'isLoadable': {
                get: function() {
                    return true;
                }
            },
            'isLoaded': {
                get: function() {
                    return this.__isLoaded;
                }
            },
            'isInitialized': {
                get: function() {
                    return this.__isInitialized;
                }
            }
        });
        target.load = Loadable.prototype.load;
        target.unload = Loadable.prototype.unload;
        target.reload = Loadable.prototype.reload;
        target.__implementEvents(
            'oninit',
            'onload',
            'onunload'
        );
    };
    Loadable.prototype.load = function() {
        if (!this.__isLoaded) {
            this.__isLoaded = true;
            if (!this.__isInitialized) {
				this.__isInitialized = true;
				this.__fire('oninit');
			}
            this.__fire('onload');
        }
    };
    Loadable.prototype.unload = function() {
        if (this.__isLoaded) {
            this.__isLoaded = false;
            this.__fire('onunload');
        }
    };
    Loadable.prototype.reload = function() {
        this.unload();
        this.load();
    };

    EventEmitter.Mixins = {
        Destructible,
        Loadable
    };

    return EventEmitter;

});