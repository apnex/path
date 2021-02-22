#!/usr/bin/env node

var grid = [
	[1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1],
	[2,1,1,1,1,1,1,2]
];
var routes = [
	["56","48","49","57","58","59","51","50","42","43","35","34","33","41","40","32","24","25","17","16","8","0","1","9","10","2","3","11","19","18","26","27","28","29","21","20","12","4","5","13","14","6","7","15","23","22","30","31","39","47","46","38","37","36","44","45","53","52","60","61","62","54","55","63"]
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
					node.tags = [];
				} else {
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
