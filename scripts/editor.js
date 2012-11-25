var PLAYER_SPEED = 2;
var M4A1_BULLET_SPEED = 7;
var M4A1_BULLET_DELAY = 8;
var HEIGHT = 650;
var WIDTH = 650;
var WORLD_HEIGHT = 3250;

var LevelEditor = Class.extend({

	map: null,
	ctx: null,
	canvas: null,
	console: null,
	player: null,
	crosshair: null,
	gui: null,
	bullets: [],
	gameObjects: [],
	players: [],
	tombstones: [],
	blockingAreas: [],
	downKeys: {},
	pressedKeys: {},
	mouseX: 0,
	mouseY: 0,
	mouseDown: false,
	bulletDelay: M4A1_BULLET_DELAY,
	fps:0,
	lastFpsUpdate: 0,
	frameCount: 0,
	viewportX: 0,
	viewportY: 0,
	dialogHolder: null,
	dialogsEl:null,

	init: function(canvas, map) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.map = map;

		this.initializeMap();

		// var self = this;
		// window.addEventListener('keydown', function(e) {
		// 	self.handleKeyDown.call(self, e);
		// }, true);
		// window.addEventListener('keyup', function(e) {
		// 	self.handleKeyUp.call(self, e);
		// }, true);
		// window.addEventListener('keypress', function(e) {
		// 	self.handleKeyPress.call(self, e);
		// }, true);
		// window.addEventListener('mousemove', function(e) {
		// 	self.handleMouseMove.call(self, e);
		// }, true);
		// this.canvas.addEventListener('mousedown', function(e) {
		// 	self.handleMouseDown.call(self, e);
		// }, true);
		// this.canvas.addEventListener('mouseup', function(e) {
		// 	self.handleMouseUp.call(self, e);
		// }, true);
		// this.canvas.addEventListener('click', function(e) {
		// 	self.handleMouseClick.call(self, e);
		// }, true);

	
	},

	initializeMap: function() {

		// players
		for (var i = 0; i < this.map.npcs.length; i++) {
			var npc = this.map.npcs[i];
			var p = new Player(this.ctx, npc.img);
			p.npc = true;
			p.vX = npc.x;
			p.vY = npc.y;
			p.gun = npc.gun;
			if (npc.hp) {
				p.hp = npc.hp;
			}
			if (npc.bounds) {
				p.bounds = npc.bounds;
			}
			if (npc.angle) {
				p.angle = npc.angle;
			}
			this.players.push(p);
		}

		// objs
		for (var i = 0; i < this.map.objects.length; i++) {
			var o = this.map.objects[i];
			var d = new Drawable(this.ctx, o.img);
			d.width = o.width;
			d.height = o.height;
			d.vY = o.y;
			d.vX = o.x;
			if (o.bounds) {
				d.bounds = o.bounds;
			}
			if (o.angle) {
				d.angle = o.angle;
			}
			this.gameObjects.push(d);
		}

		// blocks
		for (var i = 0; i < this.map.blockingAreas.length; i++) {
			this.blockingAreas.push(this.map.blockingAreas[i]);
		}

	},

	loop: function() {
		if (!window.requestAnimationFrame ) {
			window.requestAnimationFrame = (function() {
				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
					window.setTimeout(callback, 1000 / 60);
				};
			})();
		}
		var g = this;
		(function af_loop(){
			g.update();
			g.render();
			requestAnimationFrame(af_loop);
		}());
	},

	update: function() {
		// calculate fps
		this.frameCount++;
		var delta = Date.now() - this.lastFpsUpdate;
		if (delta > 1000) {
			this.fps = Math.round((1000 * this.frameCount) / delta);
			this.frameCount = 0;
			this.lastFpsUpdate = Date.now();
		}

		if (this.console) {
			var drawableCount = this.bullets.length + this.gameObjects.length + this.players.length;
			this.console.innerHTML="fps: "+this.fps + "; drawables: "+drawableCount+"; player_coords: ("+this.player.x + ","+this.player.y + "); view_coords: ("+this.viewportX+","+(Math.abs(this.viewportY))+")";
		}
	},

	render: function() {
		// tiles
		this.ctx.drawImage(assetManager.get('images/maps/forest.png'), 0, this.viewportY, 650, 3250);

	
		// players
		for (var p in this.players) {
			var player = this.players[p];

			if (player.hp <= 0) {
				var tombstone = new Tombstone(this.ctx, 'images/player3dead.png');
				tombstone.vX = player.vX;
				tombstone.vY = player.vY;
				this.tombstones.push(tombstone);
				this.players[p] = undefined; // let gc dispose
				this.players.splice(p, 1); // remove from array
				continue;
			}

			if (player.npc) {
				player.y = this.viewportY + WORLD_HEIGHT - player.vY;
				player.x = player.vX;
			}
			player.draw();
		}

		// objs
		for (var go in this.gameObjects) {
			this.gameObjects[go].y = this.viewportY + WORLD_HEIGHT - this.gameObjects[go].vY;
			this.gameObjects[go].x = this.gameObjects[go].vX;
			this.gameObjects[go].draw();
		}

		for (var a in this.blockingAreas) {
			var area = this.blockingAreas[a];
			this.ctx.save();
			this.ctx.globalAlpha = 0.5;
			this.ctx.translate(area.x,area.y);
			this.ctx.fillRect(0, 0, area.width, area.height);
			this.ctx.restore();
		}
		
		this.ctx.save();
		this.ctx.globalAlpha = 0.5;
		this.ctx.translate(this.map.bombZone.x,this.map.bombZone.y);
		this.ctx.fillRect(0, 0, this.map.bombZone.width, this.map.bombZone.height);
		this.ctx.restore();

	},

	handleKeyDown: function(evt) {
		this.downKeys[evt.keyCode] = true;
	},

	handleKeyUp: function(evt) {
		this.downKeys[evt.keyCode] = false;
	},

	handleKeyPress: function(evt) {
		this.pressedKeys[evt.keyCode] = true;
	},

	handleMouseMove: function(evt) {
        this.mouseX = evt.clientX - this.canvas.offsetLeft;
        this.mouseY = evt.clientY - 10;
	},

	handleMouseUp: function(evt) {
		this.mouseDown = false;
	},

	handleMouseDown: function(evt) {
		this.mouseDown = true;
	},

	handleMouseClick: function(evt) {
		if (this.player.getGun().ammo <= 0 ||
			this.player.reloading) {
			return;
		}
		var bullet = new Bullet(this.ctx, 'images/bullet.jpg');
		bullet.width = 4;
		bullet.height = 2;
		bullet.angle = this.player.angle;

		var sY = Math.sin(this.player.angle) * M4A1_BULLET_SPEED;
		var sX = Math.cos(this.player.angle) * M4A1_BULLET_SPEED;

		// determine starting position of bullet
		bullet.x = this.player.x + (sX * 3.5);
		bullet.y = this.player.y + (sY * 3.5);

		this.bullets.push({
			drawable: bullet,
			speedX: sX,
			speedY: sY
		});

		if (this.player.gun == 'images/guns/shotgun.png') {
			for (var i = -2; i < 2; i++) {
				bullet = new Bullet(this.ctx, 'images/bullet.jpg');
				bullet.width = 4;
				bullet.height = 2;
				bullet.angle = this.player.angle + (0.1*i);

				var sY = Math.sin(bullet.angle) * M4A1_BULLET_SPEED;
				var sX = Math.cos(bullet.angle) * M4A1_BULLET_SPEED;

				// determine starting position of bullet
				bullet.x = this.player.x + (sX * 3.5);
				bullet.y = this.player.y + (sY * 3.5);

				this.bullets.push({
					drawable: bullet,
					speedX: sX,
					speedY: sY
				});
			}
		}

		this.player.getGun().ammo--;

		this.bulletDelay = M4A1_BULLET_DELAY;
	},

	collidesWithObject: function(newX, newY) {
		for (var i = 0; i < this.gameObjects.length; i++) {
			var go = this.gameObjects[i];
			var x = this.gameObjects[i].x - (this.gameObjects[i].width/2);
			var y = this.gameObjects[i].y - (this.gameObjects[i].height/2);
			x += this.gameObjects[i].getBounds().x;
			y += this.gameObjects[i].getBounds().y;
			if (newX >= x &&
				newX <= x + go.getBounds().width &&
				newY >= y &&
				newY <= y + go.getBounds().height) {
				return true;
			}
		}
		for (var i = 0; i < this.blockingAreas.length; i++) {
			var a = this.blockingAreas[i];
			var x = this.blockingAreas[i].x;
			var y = this.blockingAreas[i].y;
			if (newX >= x &&
				newX <= x + this.blockingAreas[i].width &&
				newY >= y &&
				newY <= y + this.blockingAreas[i].height) {
				return true;
			}
		}
		
		return false;
	},

	collidesWithPlayer: function(newX, newY, opt_player) {
		var players = this.players;
		for (var i = 0; i < players.length; i++) {
			var player = players[i];
			if (player == opt_player) {
				continue;
			}
			var x = player.x - (player.width/2);
			var y = player.y - (player.height/2);
			x += player.getBounds().x;
			y += player.getBounds().y;
			if (newX >= x &&
				newX <= x + player.getBounds().width &&
				newY >= y &&
				newY <= y + player.getBounds().height) {
				return player;
			}
		}
		return false;
	},

	processKeyInput: function() {
		if (this.downKeys[38] || this.downKeys[87]) {  /* Up arrow or W was pressed */
			var newY = this.player.y - PLAYER_SPEED;
			if (newY > 0 &&
				!this.collidesWithObject(this.player.x, newY) &&
				!this.collidesWithPlayer(this.player.x, newY, this.player)){
				if (this.player.y < 300 && this.viewportY < 0) {
					this.viewportY += PLAYER_SPEED;
				} else {
					this.player.y -= PLAYER_SPEED;
				}
			}
		}
		if (this.downKeys[40] || this.downKeys[83]) {  /* Down arrow or S was pressed */
			var newY = this.player.y + PLAYER_SPEED
			if (newY < HEIGHT &&
				!this.collidesWithObject(this.player.x, newY) &&
				!this.collidesWithPlayer(this.player.x, newY, this.player)){
				if (this.player.y > 350 && this.viewportY >  HEIGHT - WORLD_HEIGHT) {
					this.viewportY -= PLAYER_SPEED;
				} else {
					this.player.y += PLAYER_SPEED;
				}
			}
		}
		if (this.downKeys[37] || this.downKeys[65]) {  /* Left arrow or A was pressed */
			var newX = this.player.x - PLAYER_SPEED;
			if (newX > 0 &&
				!this.collidesWithObject(newX, this.player.y) &&
				!this.collidesWithPlayer(newX, this.player.y, this.player)){
				this.player.x -= PLAYER_SPEED;
			}
		}
		if (this.downKeys[39] || this.downKeys[68]) {  /* Right arrow or D was pressed */
			var newX = this.player.x + PLAYER_SPEED;
			if (newX < WIDTH &&
				!this.collidesWithObject(newX, this.player.y) &&
				!this.collidesWithPlayer(newX, this.player.y, this.player)){
				this.player.x += PLAYER_SPEED;
			}
		}

		if (this.downKeys[82]) { /* R was pressed */
			if (this.player.getGun().ammo < this.player.getGun().clipSize &&
				this.player.getGun().totalAmmo > 0) {
				this.player.reload();
			}
		}

		if (this.pressedKeys[81] || this.pressedKeys[113]) { /* Q was pressed */
			this.pressedKeys[81] = false;
			this.pressedKeys[113] = false;
			if (!this.dialog) {
				var self = this;
				this.showDialog("dialog-weapons", function() {
					var switchToGun = function(key){
						if (!(key in self.player.guns)) {
							return false;
						}
						var gun = self.player.guns[key];
						if (gun.ammo <= 0 && gun.totalAmmo <= 0) {
							return false;
						}
						self.player.gun = key;
						return true;
					}
					var lis = self.dialog.querySelectorAll("li");
					for(var i = 0; i < lis.length; i++) {
						(function(li) {
							li.addEventListener("click", function(evt) {
								switchToGun(li.getAttribute('data-gun'));
								self.closeDialog();
							});
							var gun = self.player.guns[li.getAttribute('data-gun')];
							if (gun.ammo <= 0 && gun.totalAmmo <= 0){
								li.className += ' disabled';
								li.innerHTML += '<span class="ammo">Out of ammo<span></span></span>';
							}
						})(lis[i]);
					}

					var winListener = function(evt) {
						switch(evt.keyCode) {
							case 49:
								switchToGun('images/guns/m4a1.png');
								self.closeDialog();
								break;
							case 50:
								switchToGun('images/guns/deagle.png');
								self.closeDialog();
								break;
							case 51:
								switchToGun('images/guns/shotgun.png');
								self.closeDialog();
								break;
						}
					}
					window.addEventListener("keypress", winListener, false);
					self.dialog.dispose = function() {
						window.removeEventListener("keypress", winListener, false);
					}
				});
			} else {
				this.closeDialog();
			}
		}
	},

	processMouseInput: function(evt) {
        this.player.face(this.mouseX, this.mouseY);
        this.crosshair.x = this.mouseX;
        this.crosshair.y = this.mouseY;

		if (this.mouseDown && this.player.gun == 'images/guns/m4a1.png') {
			if (this.bulletDelay > 0) {
				this.bulletDelay--;
				return;
			}

			if (this.player.getGun().ammo <= 0 ||
				this.player.reloading) {
				return;
			}

			this.bulletDelay = M4A1_BULLET_DELAY;

			var bullet = new Bullet(this.ctx, 'images/bullet.jpg');
			bullet.width = 4;
			bullet.height = 2;
			bullet.angle = this.player.angle;

			var sY = Math.sin(this.player.angle) * M4A1_BULLET_SPEED;
			var sX = Math.cos(this.player.angle) * M4A1_BULLET_SPEED;

			// determine starting position of bullet
			bullet.x = this.player.x + (sX * 3.5);
			bullet.y = this.player.y + (sY * 3.5);

			this.bullets.push({
				drawable: bullet,
				speedX: sX,
				speedY: sY
			});

			this.player.getGun().ammo--;
        }
	},

	showDialog: function(name, fn) {
		this.dialog = document.getElementById(name).cloneNode(true);
		this.dialogHolder.appendChild(this.dialog);
		this.dialogHolder.style.display = "block";
		var self = this;
		this.dialog.addEventListener("click", function(evt) {
			if (evt.target.className == "close") {
				self.closeDialog();
			}
		});
		if (typeof fn == 'function'){
			fn.call(this);
		}
	},

	closeDialog: function() {
		if (typeof this.dialog.dispose == "function") {
			this.dialog.dispose();
		}
		this.dialog = null;
		this.dialogHolder.innerHTML = "";
		this.dialogHolder.style.display = "none";
	}


});

