export default (function(EventEmitter) {

    // CLASS Repository
    Repository.prototype = Object.create(EventEmitter.prototype);
    Repository.prototype.constructor = Repository;
    function Repository(memberClass) {
        EventEmitter.call(this);
        this.__memberClass = memberClass;
        this.__members = [];
        this.__idx = 0;
        this.__isExecutingForEach = false;
    };
    // private methods
    Repository.prototype.__validate = function(member) {
        if (!(member instanceof this.__memberClass)) {
            throw new Error(this.constructor.name + ':validate - ' + member + ' must be an instance of ' + this.__memberClass.constructor.name);
        }
    };
    // public methods
    Repository.prototype.forEach = function(fn) {
        this.__isExecutingForEach = true;
        while(this.__idx < this.__members.length) {
            var member = this.__members[this.__idx];
            fn(member);
            this.__idx++;
        }
        this.__isExecutingForEach = false;
        this.__idx = 0;
    };
    Repository.prototype.store = function(member) {
        this.__validate(member);
        this.__members.push(member);
        this.__fire('onstore', member);
    };
    Repository.prototype.release = function(member) {
        this.__validate(member);
        var indexOfRemoval = this.__members.indexOf(member);
        if (indexOfRemoval > -1) {
            this.__members.splice(indexOfRemoval, 1);
            this.__fire('onrelease', member);
        }
        if (this.__isExecutingForEach && this.__idx >= indexOfRemoval) {
            this.__idx -= 1;
        }
    };

    // events
    Repository.prototype.__implementEvents(
        'onstore',
        'onrelease'
    );

    return Repository;

});