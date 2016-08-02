export default (function(engineInstancePromise) {

    // Resolves the issue of traditional for-loops breaking from index instability when subscribers unsubscribe during the publish loop.
    // Multiple callbacks can be pushed under the same subscriber
    function DynamicallyShrinkableSubscriberArray() {
        this.__contents = [];
        this.__idx = 0;
        this.__isExecutingForEach = false;
    };
    DynamicallyShrinkableSubscriberArray.prototype.__screenForDuplicates = function(subscriber, callback) {
        if (this.__indexOf(subscriber, callback) > -1 ) {
            throw new Error(this.constructor.name + ':validateForDuplicates - Duplicate entry found for subscriber ' + subscriber + '.');
        }
    };
    DynamicallyShrinkableSubscriberArray.prototype.__indexOf = function(subscriber, callback) {
        for (var i = 0, L = this.__contents.length; i < L; i++) {
            var element = this.__contents[i];
            if (element.subscriber === subscriber && element.callback === callback) {
                return i;
            }
        }
        return -1;
    };
    DynamicallyShrinkableSubscriberArray.prototype.forEach = function(fn) {
        this.__isExecutingForEach = true;
        while(this.__idx < this.__contents.length) {
            var element = this.__contents[this.__idx];
            fn(element.subscriber, element.callback);
            this.__idx++;
        }
        this.__isExecutingForEach = false;
        this.__idx = 0;
    };
    DynamicallyShrinkableSubscriberArray.prototype.push = function(subscriber, callback) {
        this.__screenForDuplicates(subscriber, callback);
        this.__contents.push({subscriber: subscriber, callback: callback});
    };
    DynamicallyShrinkableSubscriberArray.prototype.splice = function(subscriber, callback) {
        var indexOfRemoval = this.__indexOf(subscriber, callback);
        this.__contents.splice(indexOfRemoval, 1);
        if (this.__isExecutingForEach && this.__idx >= indexOfRemoval) {
            this.__idx -= 1;
        }
    };
    DynamicallyShrinkableSubscriberArray.prototype.purge = function(subscriber) {
        // remove all entries for subscriber
        for (var i = 0, L = this.__contents.length; i < L; i++) {
            var element = this.__contents[i];
            if (element.subscriber === subscriber) {
                this.__contents.splice(i, 1);
                if (this.__isExecutingForEach && this.__idx >= i) {
                    this.__idx -= 1;
                }
            }
        }
    };

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
    EventEmitter.prototype.__implementEvents = function() {
        for (var i = 0, L = arguments.length; i < L; i++) {
            var event = arguments[i];
            if (this.hasEvent(event)) {
                throw new Error(this.constructor.name + ':implementEvents - ' + event + ' has already been implemented.');
            }
            this.__eventList = this.__eventList.concat(event);
        }
    };
    EventEmitter.prototype.__fire = function(event /*, argument1, argument2, etc... */) {
        if (!this.hasEvent(event)) {
            throw new Error(this.constructor.name + ':fire - ' + event + ' event is not implemented.');
        }
        if (this.__events[event]) {
            var args = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1, arguments.length) : null;
            this.__events[event].forEach(function(subscriber, callback) {
                callback.apply(subscriber, args);
            });
        }
    };
    // public methods
    EventEmitter.prototype.addEventListener = function(event, subscriber, callback) {
        if (!this.hasEvent(event)) {
            throw new Error(this.constructor.name + ':addEventListener - ' + event + ' event is not implemented.');
        }
        if (!subscriber) {
            throw new Error(this.constructor.name + ':addEventListener - ' + ' A subscriber object must be supplied.');
        }
        if (Object.getOwnPropertyNames(subscriber).length === 0) {
            throw new Error(this.constructor.name + ':addEventListener - ' + ' Subscribers cannot be empty objects.');
        }
        if (!callback) {
            throw new Error(this.constructor.name + ':addEventListener - ' + ' A callback function must be supplied.');
        }
        if (!this.__events[event]) {
            this.__events[event] = new DynamicallyShrinkableSubscriberArray();
        }
        this.__events[event].push(subscriber, callback);
    };
    EventEmitter.prototype.removeEventListener = function(event, subscriber, callback) {
        this.__events[event].splice(subscriber, callback);
    };
    EventEmitter.prototype.purgeEventListenersBoundTo = function(subscriber) {
        for (var event in this.__events) {
            if (this.__events.hasOwnProperty(event)) {
                this.__events[event].purge(subscriber);
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