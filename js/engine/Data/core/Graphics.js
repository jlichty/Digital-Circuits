export default (function() {
    
    var $ = {};

    function SourcePair() {};
    $.SourcePair = SourcePair;

    ImageSourcePair.prototype = Object.create(SourcePair.prototype);
    ImageSourcePair.prototype.constructor = ImageSourcePair;
    function ImageSourcePair(targetPrototype, sourceURL) {
        this.target = targetPrototype;
        this.src = sourceURL;
    };
    $.ImageSourcePair = ImageSourcePair;

    SpriteSourcePair.prototype = Object.create(SourcePair.prototype);
    SpriteSourcePair.prototype.constructor = SpriteSourcePair;
    function SpriteSourcePair(targetPrototype, sourceURLArray) {
        this.target = targetPrototype;
        this.src = sourceURLArray;
    };
    $.SpriteSourcePair = SpriteSourcePair;

    AssetMap.prototype = Object.create(Array.prototype);
    AssetMap.prototype.constructor = AssetMap;
    function AssetMap() {
        Array.call(this);
        for (var i = 0, L = arguments.length; i < L; i++) {
            this.push(arguments[i]);
        }
    };
    $.AssetMap = AssetMap;

    ImageMap.prototype = Object.create(AssetMap.prototype);
    ImageMap.prototype.constructor = ImageMap;
    function ImageMap(/* ImageSourcePairs */) {
        AssetMap.apply(this, arguments);
    };
    $.ImageMap = ImageMap;

    SpriteMap.prototype = Object.create(AssetMap.prototype);
    SpriteMap.prototype.constructor = SpriteMap;
    function SpriteMap(/* SpriteSourcePairs */) {
        AssetMap.apply(this, arguments);
    };
    $.SpriteMap = SpriteMap;

    $.Sprite = function(imageArray) {
        this.frames = imageArray;
    };

    $.LineStyleTemplate = function(strokeStyle, lineWidth) {
        this.strokeStyle = strokeStyle || 'black';
        this.lineWidth = lineWidth || 1;
    };

    $.MeshStyleTemplate = function(strokeStyle, fillStyle, lineWidth) {
        this.strokeStyle = strokeStyle || 'black';
        this.fillStyle = fillStyle;
        this.lineWidth = lineWidth || 1;
    };

    $.ImageStyleTemplate = function(sourceX, sourceY, sourceWidth, sourceHeight, destWidth, destHeight) {
        this.sourceX = sourceX;
        this.sourceY = sourceY;
        this.sourceWidth = sourceWidth;
        this.sourceHeight = sourceHeight;
        this.destWidth = destWidth;
        this.destHeight = destHeight;
    };


    // ctx.fillStyle = '#51ED39';
    // ctx.strokeStyle = (powered) ? ((state) ? '#00FF00' : '#FF5AC8') : 'black';
    // function highlightYellow() {
    //     ctx.save();
    //     ctx.beginPath();
    //     ctx.arc(this.connectionAnchor.x, this.connectionAnchor.y, 6, 0, 2 * Math.PI);
    //     ctx.fillStyle = 'yellow';
    //     ctx.fill();
    //     ctx.stroke();
    //     ctx.restore();
    // };


    return $;

});