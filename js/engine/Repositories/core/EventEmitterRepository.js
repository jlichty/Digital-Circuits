export default (function(Repository, EventEmitter) {

    // CLASS EventEmitterRepository
    EventEmitterRepository.prototype = Object.create(Repository.prototype);
    EventEmitterRepository.prototype.constructor = EventEmitterRepository;
    function EventEmitterRepository() {

        Repository.call(this, EventEmitter);

    };
    EventEmitterRepository.prototype.purgeEventListenersBoundTo = function(subscriber) {
        this.forEach(function(eventEmitter) {
            eventEmitter.purgeEventListenersBoundTo(subscriber);
        });
    };

    return EventEmitterRepository;

});