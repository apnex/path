#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');

// this is a declarative controller
// takes a manifest and translates into iterative API calls against engine

// called from shell
const args = process.argv.splice(2);
if(process.argv[1].match(/nodes.create/g)) {
	let rgxFilter = new RegExp('([^,:]+):([^,:]*)', 'g');
	while(m = rgxFilter.exec(args[0])) {
		let x = m[1];
		let y = m[2];
		if(x != undefined && y != undefined) {
			main({x, y});
		}
	}
}

async function main(pos) {
	try {
		console.log('Creating node at [ ' + pos.x + ':' + pos.y + ' ]');
		fractal.nodesCreate({
			grid: pos
		});
	} catch (error) {
		console.log(error.message);
	}
};
