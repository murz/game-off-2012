var PLAYER_SPEED = 2;
var M4A1_BULLET_SPEED = 7;
var M4A1_BULLET_DELAY = 8;
var HEIGHT = 650;
var WIDTH = 650;
var WORLD_HEIGHT = 3250;

var Game = Class.extend({

	map: null,
	ctx: null,
	canvas: null,
	audioCtx:null,
	console: null,
	player: null,
	crosshair: null,
	gui: null,
	bullets: [],
	gameObjects: [],
	blockingAreas: [],
	players: [],
	tombstones: [],
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
	sounds: {},

	init: function(canvas, map) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		try {
			this.audioCtx = new webkitAudioContext();
			this.loadSound('m4-bullet', 'sounds/m4a1.mp3');
			this.loadSound('m4-reload', 'sounds/reload.mp3');
			this.loadSound('deagle-bullet', 'sounds/deagle_shot.mp3');
		} catch (e) {
			alert('HTML5 Web Audio API is not supported in this browser. You can play the game but it will have no sound :(');
		}

		this.map = map;

		this.player = new Player(this.ctx, 'images/player1.png');
		this.player.width = 42;
		this.player.height = 42;
		this.player.x = 50;
		this.player.y = HEIGHT - 90;
		this.player.armor = 100;
		this.player.gun = 'images/guns/m4a1.png';
		this.players.push(this.player);

		this.crosshair = new Drawable(this.ctx, 'images/crosshair.png');
		this.crosshair.width = 72;
		this.crosshair.height = 72;

		this.gui = new Gui(this.ctx);

		this.viewportX = 0;
		this.viewportY = HEIGHT - WORLD_HEIGHT;

		this.initializeMap();

		var self = this;
		window.addEventListener('keydown', function(e) {
			self.handleKeyDown.call(self, e);
		}, true);
		window.addEventListener('keyup', function(e) {
			self.handleKeyUp.call(self, e);
		}, true);
		window.addEventListener('keypress', function(e) {
			self.handleKeyPress.call(self, e);
		}, true);
		window.addEventListener('mousemove', function(e) {
			self.handleMouseMove.call(self, e);
		}, true);
		this.canvas.addEventListener('mousedown', function(e) {
			self.handleMouseDown.call(self, e);
		}, true);
		this.canvas.addEventListener('mouseup', function(e) {
			self.handleMouseUp.call(self, e);
		}, true);
		this.canvas.addEventListener('click', function(e) {
			self.handleMouseClick.call(self, e);
		}, true);

		this.dialogHolder = document.getElementById("dialog-holder");
		this.dialogsEl = document.getElementById("dialogs");

		var openStartDlg = function() {
			self.showDialog("dialog-start", function() {
			self.dialog.addEventListener("click", function(evt) {
					switch (evt.target.id) {
						case 'start':
							self.closeDialog();
							break;
						case 'load':
							break;
						case 'ctrls':
							self.closeDialog();
							self.showDialog("dialog-controls", function() {
								self.dialog.addEventListener("click", function(evt) {
									if (evt.target.id == 'back') {
										self.closeDialog();
										openStartDlg.call(self);
									}
								});
							});
							break;
					}
				});
			});
		};
		//openStartDlg();

		

		var url = document.URL;
		var debug_check = /[?&]debug/i;
		if (debug_check.exec(url)) {
			document.getElementById("debug").innerHTML = "&larr; Exit Debug Mode";
			document.getElementById("debug").onclick = function() {
				window.location = window.location.href.split("?")[0];
				return false;
			};
			var consoleWrap = document.createElement("div");
			consoleWrap.id = "console-wrap";
			this.console = document.createElement("div");
			this.console.id = "console";
			consoleWrap.appendChild(this.console);
			document.body.appendChild(consoleWrap);
			window.DEBUG = true;
		}
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
		this.processKeyInput();
		this.processMouseInput();

		// update npcs
		for (var p in this.players) {
			var player = this.players[p];
			if (!player.npc) {
				continue;
			}

			if (!player.asleep) {
				player.face(this.player.x, this.player.y);
				if (player.firingDelay == player.firingSpeed) {
					player.firingDelay = 0;
					this.fireBullet(player.x,
									player.y,
									player.angle,
									player.gun);
				} else {
					player.firingDelay++;
				}
				continue;
			} else {
				// TODO: do something random
			}

			var ux = this.player.x;
			var uy = this.player.y;

			var px = player.x;
			var py = player.y;
			var sight = player.vision;

			if ((ux < px + sight &&
				ux > px - sight) &&
				(uy < py + sight &&
				uy > py - sight)) {
				player.wake();
			}
		}

		// move bullets
		for (var b in this.bullets) {
			var bullet = this.bullets[b];
			if (bullet.drawable.isBlood) {
				bullet.drawable.bloodFrames--;
				if (bullet.drawable.bloodFrames <= 0) {
					this.bullets[b] = undefined; // let gc dispose
					this.bullets.splice(b, 1); // remove from array
				}
				continue;
			}

			bullet.drawable.vX += bullet.speedX;
			bullet.drawable.vY -= bullet.speedY;

			bullet.drawable.x = bullet.drawable.vX;
			bullet.drawable.y = this.viewportY + WORLD_HEIGHT - bullet.drawable.vY;

			// detect bullet collisions
			if (this.collidesWithObject(bullet.drawable.x, bullet.drawable.y)) {
				this.bullets[b] = undefined; // let gc dispose
				this.bullets.splice(b, 1); // remove from array
			}

			// detect bullet hits
			var victim = this.collidesWithPlayer(bullet.drawable.x, bullet.drawable.y);
			if (victim) {
				if (victim.armor > 0) {
					victim.armor -= bullet.drawable.strength;
				} else {
					victim.hp -= bullet.drawable.strength;
				}
				this.bullets[b].drawable.hit();
				if (victim.npc && victim.asleep) {
					victim.wake();
				}
			}
		}

		this.gui.player = this.player;

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

		// tombstones (dead players)
		for (var t in this.tombstones) {
			var tombstone = this.tombstones[t];
			tombstone.y = this.viewportY + WORLD_HEIGHT - tombstone.vY;
			tombstone.x = tombstone.vX;
			tombstone.draw();
			tombstone.deadFrames--;
			if(tombstone.deadFrames <= 0) {
				this.tombstones[t] = undefined; // let gc dispose
				this.tombstones.splice(t, 1); // remove from array
			}
		}

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

		// player
		// this.player.draw();

		// bullets
		for(var b in this.bullets) {
			this.bullets[b].drawable.draw();
			if (this.bullets[b].drawable.x > WIDTH ||
				this.bullets[b].drawable.y > HEIGHT ||
				this.bullets[b].drawable.x < 0 ||
				this.bullets[b].drawable.y < 0) {

				this.bullets[b] = undefined; // let gc dispose
				this.bullets.splice(b, 1); // remove from array
			}
		}

		// objs
		for (var go in this.gameObjects) {
			this.gameObjects[go].y = this.viewportY + WORLD_HEIGHT - this.gameObjects[go].vY;
			this.gameObjects[go].x = this.gameObjects[go].vX;
			this.gameObjects[go].draw();
		}

		// gui
		this.gui.draw();

		// xhair
		this.crosshair.draw();
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

	fireBullet: function(x, y, angle, gun) {
		var bullet = new Bullet(this.ctx, 'images/bullet.jpg');
		bullet.width = 4;
		bullet.height = 2;
		bullet.angle = angle;

		var sY = Math.sin(angle) * M4A1_BULLET_SPEED;
		var sX = Math.cos(angle) * M4A1_BULLET_SPEED;

		var playerVY = (WORLD_HEIGHT + this.viewportY) - y;

		// determine starting position of bullet
		bullet.vX = x + (sX * 3.55);
		bullet.vY = playerVY - (sY * 3.5);
		this.bullets.push({
			drawable: bullet,
			speedX: sX,
			speedY: sY
		});

		// switch (gun) {
		// 	case 'images/guns/deagle.png':
		// 		this.playSound('deagle-bullet');
		// 		break;
		// 	case 'images/guns/shotgun.png':
		// 	case 'images/guns/m4a1.png':
		// 	default:
				this.playSound('m4-bullet');
		// }
	},

	handleMouseClick: function(evt) {
		if (this.player.getGun().ammo <= 0 ||
			this.player.reloading) {
			return;
		}

		this.fireBullet(this.player.x,
						this.player.y,
						this.player.angle,
						this.player.gun);
		

		if (this.player.gun == 'images/guns/shotgun.png') {
			for (var i = -2; i < 2; i++) {
				this.fireBullet(this.player.x,
						this.player.y,
						this.player.angle + (0.1*i),
						this.player.gun);
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
			var x = this.blockingAreas[i].x;
			var y = this.viewportY + this.blockingAreas[i].y;
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
				this.player.getGun().totalAmmo > 0 &&
				!this.player.reloading) {
				this.player.reload();
				this.playSound('m4-reload');
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

			this.fireBullet(this.player.x,
							this.player.y,
							this.player.angle,
							this.player.gun);

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
		if (typeof fn == 'function') {
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
	},

	loadSound: function(key, url) {
		var self = this;
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			self.audioCtx.decodeAudioData(request.response, function(buffer) {
				window.console.log(self.sounds);
				window.console.log(key);
				self.sounds[key] = buffer;
			}, function() { /* oops! */ });
		};

		request.send();
	},

	playSound: function(key) {
		if (!(key in this.sounds)) {
			return;
		}
		var buffer = this.sounds[key];

		var source = this.audioCtx.createBufferSource(); // creates a sound source
		source.buffer = buffer;                    // tell the source which sound to play
		source.connect(this.audioCtx.destination);       // connect the source to the context's destination (the speakers)
		source.noteOn(0);                          // play the source now
	}


});

