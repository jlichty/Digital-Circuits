export default (function(EventEmitter, AtomicArray) {

    // CLASS Repository
    Repository.prototype = Object.create(EventEmitter.prototype);
    Repository.prototype.constructor = Repository;
    function Repository(/* optional */ memberClass) {
        EventEmitter.call(this);
        this.__members = new AtomicArray(memberClass);
    };
    // public methods
    Repository.prototype.forEach = function(fn, caller) {
        this.__members.forEach(fn, caller);
    };
    Repository.prototype.store = function(member) {
        this.__members.push(member);
        this.__fire('onstore', member);
    };
    Repository.prototype.release = function(member) {
        this.__members.splice(member);
    };

    // events
    Repository.prototype.__implementEvents(
        'onstore',
        'onrelease'
    );

    return Repository;

});