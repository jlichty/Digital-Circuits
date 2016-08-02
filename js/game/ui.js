export default (function(Entity) {

    var $ = {};

    UIElement.prototype = Object.create(Entity.prototype);
    UIElement.prototype.constructor = UIElement;
    function UIElement() {
        Entity.call(this);
    };
    $.UIElement = UIElement;

    return $;

});