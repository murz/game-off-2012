window.GRASS_MAP = {
	bg: 'images/maps/forest.png',
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
		}
	]
};