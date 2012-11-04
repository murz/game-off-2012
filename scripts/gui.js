var Gui = Drawable.extend({
	player: null,

	init: function(ctx, img) {
		this._super(ctx, img);
		this.width = 650;
		this.height = 650;
		this.x = 0;
		this.y = 0;
	},

	draw: function() {
		this.ctx.save();
		this.ctx.translate(this.x,this.y);

		this.ctx.font = '14px sans-serif';
		
		// HEALTH GUI
		this.ctx.drawImage(
			assetManager.get('images/gui/health.png'),
			5,
			3,
			71,
			61);
		this.ctx.fillStyle = "#fff";
		this.ctx.globalAlpha = 0.8;
		this.ctx.shadowColor = "black";
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 1;
		this.ctx.shadowBlur = 0;
		this.ctx.fillText(this.player.hp, 40, 25);
		this.ctx.fillText(this.player.armor, 40, 52);
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.globalAlpha = 1;

		// WEAPONS GUI
		this.ctx.drawImage(
			assetManager.get('images/gui/weapons.png'),
			2,
			650 - 67 - 2,
			164,
			67);
		var gun = '';
		switch(this.player.gun) {
			case 'images/guns/m4a1.png':
				gun = 'M4A1';
				this.ctx.drawImage(
					assetManager.get('images/gui/ico_m4a1.png'),
					2 + 16,
					(650 - 67 - 2) + 15,
					41,
					39);
				break;
			case 'images/guns/deagle.png':
				gun = 'Deagle';
				this.ctx.drawImage(
					assetManager.get('images/gui/ico_deagle.png'),
					2 + 21,
					(650 - 67 - 2) + 15,
					34,
					34);
				break;
			case 'images/guns/shotgun.png':
				gun = 'Shotgun';
				this.ctx.drawImage(
					assetManager.get('images/gui/ico_shotgun.png'),
					2 + 12,
					(650 - 67 - 2) + 23,
					52,
					20);
				break;
		}
		this.ctx.font = '11px sans-serif';
		this.ctx.globalAlpha = 0.8;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 1;
		this.ctx.fillText('Gun: '+gun, 2 + 80, (650 - 67 - 2) + 33);
		this.ctx.fillText('Ammo: '+this.player.getGun().ammo +'/'+this.player.getGun().totalAmmo, 2 + 80, (650 - 67 - 2) + 49);
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.globalAlpha = 1;

		// NOTIFICATIONS
		var text = null;
		var subText = null;
		if (this.player.getGun().ammo <= 0 && this.player.getGun().totalAmmo > 0) {
			text = 'PRESS "R" TO RELOAD'
		}

		if (this.player.getGun().totalAmmo <= 0 && this.player.getGun().ammo <= 0) {
			text = 'PRESS "Q" TO SWITCH WEAPONS';
			subText = 'You are out of ammo!';
		}

		if (this.player.reloading) {
			text = 'Reloading...';
		}

		if (text != null) {
			this.ctx.font = 'bold 20px sans-serif';
			this.ctx.textAlign = 'center';
			var dim = this.ctx.measureText(text);
			this.ctx.beginPath();
			this.ctx.rect(650 / 2 - (dim.width/2) - 20, 650/2 - 27, dim.width + 40, 40);
			this.ctx.fillStyle = 'black';
			this.ctx.globalAlpha = 0.7;
			this.ctx.fill();
			this.ctx.stroke();
			this.ctx.fillStyle = 'white';
			this.ctx.globalAlpha = 1;
			this.ctx.fillText(text, 650 / 2, 650 / 2);
			if (subText != null) {
				this.ctx.font = '14px sans-serif';
				dim = this.ctx.measureText(subText);
				this.ctx.beginPath();
				this.ctx.rect(650 / 2 - (dim.width/2) - 20, 650/2 - 27 + 45, dim.width + 40, 35);
				this.ctx.fillStyle = 'black';
				this.ctx.globalAlpha = 0.5;
				this.ctx.fill();
				this.ctx.stroke();
				this.ctx.fillStyle = 'white';
				this.ctx.globalAlpha = 1;
				this.ctx.fillText(subText, 650 / 2, 650 / 2 + 42);
			}
		}


		this.ctx.restore();
	}

});