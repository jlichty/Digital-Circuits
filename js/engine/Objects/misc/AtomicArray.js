export default (function(AtomicLink) {

    // Resolves the issue of traditional for-loops breaking from index instability when contents.length fluctuates throughout the iteration cycle.
    // Index-free iteration.
    function AtomicArray(/* optional */ memberClass) {
        this.__memberClass = memberClass;
        this.__start = null;
    };
    AtomicArray.prototype.__validateMemberClass = function(member) {
        if (this.__memberClass) {
            if (!(member instanceof this.__memberClass)) {
                throw new Error(this.constructor.name + ':validateMemberClass - ' + member + ' must be an instance of ' + this.__memberClass.constructor.name);
            }
        }
    };
    AtomicArray.prototype.__validateNoDuplicateEntries = function(entry) {
        this.forEach(function(ownedEntry) {
            if (ownedEntry === entry) {
                throw new Error(this.constructor.name + ':validateNoDuplicateEntries - Duplicate entry found on ' + entry + '.');
            }
        }, this);
    };
    AtomicArray.prototype.forEach = function(fn, /* optional */ caller) {
        var link = this.__start;
        var result;
        while(link) {
            var entry = link.get();
            result = fn.call(caller, entry);
            if (result) {
                break;
            }
            link = link.next();
        }
        return result;
    };
    AtomicArray.prototype.push = function(entry) {
        this.__validateMemberClass(entry);
        this.__validateNoDuplicateEntries(entry);
        var newLink = new AtomicLink(entry);
        if (!this.__start) {
            this.__start = newLink;
            return;
        }
        var link = this.__start;
        while(link) {
            if (!link.hasNext()) {
                link.setNext(newLink);
                return;
            }
            link = link.next();
        }
    };
    AtomicArray.prototype.splice = function(entry) {
        var link = this.__start, previousLink = this.__start;
        while(link) {
            var ownedEntry = link.get();
            if (ownedEntry === entry) {
                if (link === this.__start) {
                    this.__start = link.next();
                } else {
                    previousLink.setNext(link.next()); 
                }
                return entry;
            }
            previousLink = link;
            link = link.next();
        }
        return null;
    };
    AtomicArray.prototype.contains = function(entry) {
        var result = this.forEach(function(ownedEntry) {
            if (ownedEntry === entry) {
                return true;
            }
        });
        return result ? true : false;
    };

    return AtomicArray;

});