var Tombstone = Drawable.extend({
	deadFrames: 200,
	alpha: 1,

	init: function(ctx, img) {
		this._super(ctx, img);
		this.width = 69;
		this.height = 58;
	},

	draw: function() {
		this.alpha -= 0.005;
		if (this.alpha <= 0) {
			return;
		}
		this.ctx.save();
		this.ctx.translate(this.x,this.y);
		this.ctx.rotate(this.angle);
		this.ctx.globalAlpha = this.alpha;
		this.ctx.drawImage(
			assetManager.get(this.img),
			-(this.width/2),
			-(this.height/2),
			this.width,
			this.height);
		this.ctx.globalAlpha = 1;
		this.ctx.restore();
	}
});