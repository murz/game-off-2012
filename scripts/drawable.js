var Drawable = Class.extend({

	ctx: null,
	x: 0,
	y: 0,
	vX: 0,
	vY: 0,
	width: 0,
	height: 0,
	angle: 0,
	img: null,
	bounds: null,

	init: function(ctx, img) {
		this.ctx = ctx;
		this.img = img;
	},

	getBounds: function() {
		return this.bounds || {
			x: 0,
			y: 0,
			width: this.width,
			height: this.height
		};
	},

	draw: function() {
		this.ctx.save();
		this.ctx.translate(this.x,this.y);
		this.ctx.rotate(this.angle);
		this.ctx.drawImage(
			assetManager.get(this.img),
			-(this.width/2),
			-(this.height/2),
			this.width,
			this.height);
		this.ctx.restore();
	}

});