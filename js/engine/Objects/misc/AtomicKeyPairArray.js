export default (function(AtomicLink) {
    
    // Resolves the issue of traditional for-loops breaking from index instability when contents.length fluctuates throughout the iteration cycle
    function AtomicKeyPairArray() {
        this.__start = null;
    };
    AtomicKeyPairArray.prototype.__validateNoDuplicatePairs = function(key, value) {
        this.forEach(function(ownedEntry) {
            if (ownedEntry.key === key && ownedEntry.value === value) {
                throw new Error(this.constructor.name + ':validateNoDuplicatePairs - Duplicate entry found on key: ' + key + ' value: ' + value);
            }
        }, this);
    };
    AtomicKeyPairArray.prototype.forEach = function(fn, /* optional */ caller) {
        var link = this.__start;
        var result;
        while(link) {
            var entry = link.get();
            result = fn.call(caller, entry.key, entry.value);
            if (result) {
                break;
            }
            link = link.next();
        }
        return result;
    };
    AtomicKeyPairArray.prototype.push = function(key, value) {
        this.__validateNoDuplicatePairs(key, value);
        var newLink = new AtomicLink({key: key, value: value});
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
    AtomicKeyPairArray.prototype.splice = function(key, value) {
        var link = this.__start, previousLink = this.__start;
        while(link) {
            var entry = link.get();
            if (entry.key === key && entry.value === value) {
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
    AtomicKeyPairArray.prototype.purgeEntriesWithKey = function(key) {
        var link = this.__start, previousLink = this.__start;
        while(link) {
            var entry = link.get();
            if (entry.key === key) {
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

    return AtomicKeyPairArray;

});