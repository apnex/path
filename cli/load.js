#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');

// this is a declarative controller
// takes a manifest and translates into iterative API calls against engine

async function main() {
	try {
		// get product index
		let schema = require('./model.json');

		// build nodes
		schema.nodes.forEach((node) => {
			console.log('Creating node at [ ' + node.grid.x + ':' + node.grid.y + ' ]');
			fractal.nodesCreate(node);
		});

		// build paths
		schema.paths.forEach((path) => {
			fractal.pathsCreate(path);
		});

	} catch (error) {
		console.log(error.message);
	}
};

main();

