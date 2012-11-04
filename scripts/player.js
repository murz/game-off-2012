var Player = Drawable.extend({
	hp: 100,
	armor: 0,
	speed: 2,
	reloadDelay: 120,
	reloadDelayCount: 0,
	reloading: false,
	gun: 'images/guns/m4a1.png',
	guns: {
		'images/guns/m4a1.png': {
			ammo: 30,
			totalAmmo: 30 * 4,
			clipSize: 30,
		},
		'images/guns/deagle.png': {
			ammo: 7,
			totalAmmo: 7 * 5,
			clipSize: 7,
		},
		'images/guns/shotgun.png': {
			ammo: 8,
			totalAmmo: 8 * 5,
			clipSize: 8,
		}
	},

	// specific to npcs (bad design, yea yea...)
	npc: false,
	asleep: true,
	vision: 350,
	firingSpeed: 50,
	firingDelay: 0,

	init: function(ctx, img) {
		this._super(ctx, img);
		this.width = 42;
		this.height = 42;
	},

	draw: function() {
		if (this.reloading) {
			this.reloadDelayCount++;
			if (this.reloadDelayCount >= this.reloadDelay) {
				var toLoad = this.getGun().clipSize - this.getGun().ammo;
				if (this.getGun().totalAmmo < toLoad) {
					toLoad = this.getGun().totalAmmo;
				}
				this.getGun().totalAmmo -= toLoad;
				this.getGun().ammo += toLoad;
				this.reloadDelayCount = 0;
				this.reloading = false;
			}
		}
		this.ctx.save();
		this.ctx.translate(this.x,this.y);
		if (window.DEBUG) {
			this.ctx.fillText("("+this.x+","+this.y+")", 0, -20);
		}
		this.ctx.rotate(this.angle);
		this.ctx.drawImage(
			assetManager.get(this.img),
			-(this.width/2),
			-(this.height/2),
			this.width,
			this.height);
		this.ctx.drawImage(
			assetManager.get(this.gun),
			-(this.width/2),
			-(this.height/2),
			this.width,
			this.height);
		this.ctx.restore();
	},

	face: function(mX,mY) {
		var y = mY - this.y;
        var x = mX - this.x;
        var angle = Math.atan2(y, x);
        this.angle = angle;
	},

	wake: function() {
		this.asleep = false;
	},

	getGun: function() {
		return this.guns[this.gun];
	},

	reload: function() {
		this.reloading = true;
	}

});