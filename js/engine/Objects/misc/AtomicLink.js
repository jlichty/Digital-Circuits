export default (function() {

    function AtomicLink(value) {
        this.__value = value;
        this.__next = null; 
    };
    AtomicLink.prototype.__validateLink = function(link) {
        if (link && !(link instanceof AtomicLink)) {
            throw new Error(this.constructor.name + ':validateLink - ' + link + ' must be an instance of ' + this.constructor.name + ' or must be null.');
        }
    };
    AtomicLink.prototype.hasNext = function() {
        return (this.next()) ? true : false;
    };
    AtomicLink.prototype.setNext = function(link) {
        this.__validateLink(link);
        this.__next = link;
    };
    AtomicLink.prototype.next = function() {
        return this.__next;
    };
    AtomicLink.prototype.get = function() {
        return this.__value;
    };

    return AtomicLink;

});