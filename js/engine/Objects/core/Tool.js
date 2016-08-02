export default (function() {

    function Tool() {};
    Tool.prototype.pickableEntityClassesList = [];
    Tool.prototype.equip = function(entity) {};
    Tool.prototype.discard = function() {};
    Tool.prototype.mousemove = function(cursor) {};
    Tool.prototype.mousedown = function(cursor) {};
    Tool.prototype.mouseup = function(cursor) {};
    Tool.prototype.click = function(cursor) {};
    Tool.prototype.keyup = function(keyCode) {};
    Tool.prototype.keydown = function(keyCode) {};
    Tool.prototype.mouseenter = function(entities) {};
    Tool.prototype.mousehover = function(entities) {};
    Tool.prototype.mouseleave = function(entities) {};

    return Tool;

});