var Bullet = Drawable.extend({
	bloodFrames: 4,
	img: 'images/bullet.jpg',
	bloodImg: 'images/effects/blood.png',
	isBlood: false,
	disposeMe: false,
	strength: 2,

	draw: function() {
		// If we aren't rendering blood then draw as a normal drawable.
		if (!this.isBlood) {
			this._super();
			return;
		}

		// Otherwise, do this ghetto 4-frame blood animation:
		var x = (this.bloodFrames == 4 || this.bloodFrames == 2) ? 0 : 16;
		var y = (this.bloodFrames == 4 || this.bloodFrames == 3) ? 0 : 16;

		this.ctx.save();
		this.ctx.drawImage(
			assetManager.get(this.bloodImg),
			x,
			y,
			16,
			16,
			this.x,
			this.y,
			16,
			16);
		this.ctx.restore();
	},

	hit: function() {
		this.isBlood = true;
	}
});