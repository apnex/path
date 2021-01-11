#!/usr/bin/env node

var grid = [
	[2,1,1,2],
	[1,0,0,1],
	[1,0,0,1],
	[2,1,1,2]
];
var routes = [
	[0,3,11,8,0]
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
