export default (function(Repository, Entity) {

    // CLASS EntityRepository
    EntityRepository.prototype = Object.create(Repository.prototype);
    EntityRepository.prototype.constructor = EntityRepository;
    function EntityRepository() {

        Repository.call(this, Entity);

    };

    return EntityRepository;

});