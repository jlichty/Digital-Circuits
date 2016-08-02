export default (function(Loader, Graphics) {
	
	// CLASS AssetLoader
	AssetLoader.prototype = Object.create(Loader.prototype);
    AssetLoader.prototype.constructor = AssetLoader;
	function AssetLoader() {
		Loader.call(this);
	};
	AssetLoader.prototype.load = function(/* assetMaps */) {
		Loader.prototype.load.call(this);
		for (var i = 0, I = arguments.length; i < I; i++) {
			var assetMap = arguments[i];
			if (!(assetMap instanceof Graphics.AssetMap)) {
				throw new Error(this.constructor.name + ':load - ' + assetMap + ' must be an instance of AssetMap.');
			}
			this.__loadTotal += assetMap.length;
			if (assetMap instanceof Graphics.ImageMap) {
				for (var j = 0, J = assetMap.length; j < J; j++) {
					var image = new Image();
					image.onload = this.__itemFinishedLoading.bind(this);
					image.onerror = this.__itemFinishedLoadingWithError;
					image.src = assetMap[j].src;
					assetMap[j].target.image = image;
				}
			}
			if (assetMap instanceof Graphics.SpriteMap) {
				for (var j = 0, J = assetMap.length; j < J; j++) {
					var frames = [];
					for (var k = 0, K = assetMap[j].src.length; k < K; k++) {
						var frame = new Image();
						frame.onload = this.__itemFinishedLoading.bind(this);
						frame.onerror = this.__itemFinishedLoadingWithError;
						frame.src = assetMap[j].src[k];
						frames.push(frame);
					}
					assetMap[j].target.sprite = new Graphics.Sprite(frames);
				}
			}
		}
		return this;
	};

	return AssetLoader;

});