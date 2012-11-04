var AssetManager = Class.extend({

	loaded: {},

	init: function() {
	},

	load: function(srcs, fn, scope) {
		fn = fn || function(){};
		scope = scope || {};
		var count = 0;
		var _this = this;

		function loadImg(src, img){
			img.onload = function() {
				_this.loaded[src] = img;
				count--;
				if (count === 0) {
					fn.call(scope);
				}
			};
		}

		for (var i = 0; i < srcs.length; i++) {
			var img = new Image();
			var src = srcs[i];
			loadImg(src, img);
			count++;
			img.src = src;
		}
	},

	get: function(src) {
		if (!(src in this.loaded)) {
			throw new Error("Attempt to get image that was not loaded: "+src);
		}
		return this.loaded[src];
	}
});

window['assetManager'] = new AssetManager();