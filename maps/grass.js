window.GRASS_MAP = {
	bg: 'images/maps/forest.png',
	bombZone: {
		x: 0,
		y: 0,
		width: 650,
		height: 275
	},
	npcs: [
		{
			img: 'images/player3.png',
			gun: 'images/guns/m4a1.png',
			x: 550,
			y: 550,
			hp: 10,
			angle: 1.8,
		},
		{
			img: 'images/player3.png',
			gun: 'images/guns/m4a1.png',
			x: 500,
			y: 600,
			hp: 10,
			angle: 2
		},
		{
			img: 'images/player3.png',
			gun: 'images/guns/m4a1.png',
			x: 400,
			y: 500,
			hp: 10,
			angle: -0.5,
			bounds: {
				x: 0,
				y: 0,
				width: 32,
				height: 32
			}
		},
		{
			img: 'images/player3.png',
			gun: 'images/guns/m4a1.png',
			x: 600,
			y: 900,
			hp: 10,
			angle: 2
		},
		{
			img: 'images/player3.png',
			gun: 'images/guns/m4a1.png',
			x: 550,
			y: 920,
			hp: 10,
			angle: 2,
			bounds: {
				x: 0,
				y: 0,
				width: 32,
				height: 32
			}
		},
		{
			img: 'images/player3.png',
			gun: 'images/guns/m4a1.png',
			x: 450,
			y: 1100,
			hp: 10,
			angle: 2,
			bounds: {
				x: 0,
				y: 0,
				width: 32,
				height: 32
			}
		},
		{
			img: 'images/player3.png',
			gun: 'images/guns/m4a1.png',
			x: 100,
			y: 1150,
			hp: 10,
			angle: 0.5,
			bounds: {
				x: 0,
				y: 0,
				width: 32,
				height: 32
			}
		}
	],
	objects: [
		// PLANTS
		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 250,
			x: 0,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},
		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 400,
			x: 150,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},
		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 650,
			x: 70,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 700,
			x: 600,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 800,
			x: 260,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 850,
			x: 100,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 1150,
			x: 550,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 1250,
			x: 600,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 1250,
			x: 400,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 1300,
			x: 100,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 1500,
			x: 70,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},

		{
			img: 'images/plant.png',
			width: 163,
			height: 158,
			y: 1700,
			x: 90,
			bounds: {
				x: 63,
				y: 58,
				width: 50,
				height: 50
			}
		},


		// CRATES
		{
			img: 'images/crate.png',
			width: 98,
			height: 94,
			y: 220,
			x: 200,
			angle: -0.2
		},
		{
			img: 'images/crate.png',
			width: 98,
			height: 94,
			y: 360,
			x: 350,
			angle: 0
		},
		{
			img: 'images/crate.png',
			width: 98,
			height: 94,
			y: 580,
			x: 250,
			angle: 0
		},
		{
			img: 'images/crate.png',
			width: 98,
			height: 94,
			y: 1010,
			x: 500,
			angle: 1
		},
		{
			img: 'images/crate.png',
			width: 98,
			height: 94,
			y: 1050,
			x: 100,
			angle: 0
		},
		{
			img: 'images/crate.png',
			width: 98,
			height: 94,
			y: 1410,
			x: 570,
			angle: 0
		}
	],
	blockingAreas: [
		{
			x: 0,
			y: 985,
			width: 67,
			height: 125
		},
		{
			x: 205,
			y: 1025,
			width: 60,
			height: 110
		},
		{
			x: 265,
			y: 1005,
			width: 50,
			height: 130
		},
		{
			x: 410,
			y: 995,
			width: 40,
			height: 90
		},
		{
			x: 390,
			y: 995,
			width: 20,
			height: 95
		},
		{
			x: 370,
			y: 995,
			width: 20,
			height: 100
		},
		{
			x: 350,
			y: 995,
			width: 20,
			height: 110
		},
		{
			x: 330,
			y: 995,
			width: 20,
			height: 120
		},
		{
			x: 310,
			y: 995,
			width: 20,
			height: 130
		},
		{
			x: 590,
			y: 995,
			width: 100,
			height: 130
		}
	]
};