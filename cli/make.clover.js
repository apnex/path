#!/usr/bin/env node

var grid = [
	[0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0],
	[0,0,0,0,2,0,1,0,0,1,0,1,0,0,1,0,2,0,0,0,0],
	[0,0,0,0,0,2,1,0,0,1,0,1,0,0,1,2,0,0,0,0,0],
	[0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0],
	[0,2,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,2,0],
	[0,0,2,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,2,0,0],
	[0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0],
	[1,0,0,1,0,2,1,0,0,1,0,0,0,0,0,0,2,1,0,0,1],
	[1,0,0,1,0,2,1,0,0,1,0,0,0,0,0,0,2,1,0,0,1],
	[0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0],
	[1,0,0,1,2,0,0,0,0,0,0,1,0,0,1,2,0,1,0,0,1],
	[1,0,0,1,2,0,0,0,0,0,0,1,0,0,1,2,0,1,0,0,1],
	[0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0],
	[0,0,2,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,2,0,0],
	[0,2,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,2,0],
	[0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0],
	[0,0,0,0,0,2,1,0,0,1,0,1,0,0,1,2,0,0,0,0,0],
	[0,0,0,0,2,0,1,0,0,1,0,1,0,0,1,0,2,0,0,0,0],
	[0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0]
];
var routes = [
	["28","20","21","30"],
	["29","24","25","58"],
	["79","84","85","52"],
	["78","88","89","80"],
	["32","27","26","59"],
	["33","23","22","31"],
	["82","87","86","53"],
	["83","91","90","81"],
	["11","10","36","37"],
	["5","4","64","65"],
	["97","96","44","45"],
	["103","102","72","73"],
	["14","15","67","66"],
	["8","9","39","38"],
	["100","101","75","74"],
	["106","107","47","46"]
];

function compilePath(paths) {
	let hops = [];
	paths.forEach((path) => {
		let hopPair = [];
		path.forEach((hop) => {
			hopPair.push(hop);
			if(hopPair.length == 2) {
				hops.push([hopPair[0], hopPair[1]]);
				hopPair.shift();
			}
		});
	});
	return hops;
}

function compileGrid(grid) {
	let nodes = [];
	let pos = {
		x: 0,
		y: 0
	};
	grid.forEach((row) => {
		pos.x = 0;
		row.forEach((cell) => {
			if(cell) {
				let node = {
					grid: {
						x: pos.x,
						y: pos.y
					}
				};
				if(cell == 2) {
					node.tags = [ 'hidden' ];
				}
				nodes.push(node);
			}
			pos.x++;
		});
		pos.y++;
	});

	let paths = routes.map((route) => {
		return {
			route
		};
	});

	return {
		nodes,
		paths
	};
};

console.log(JSON.stringify(compileGrid(grid), null, "\t"));
