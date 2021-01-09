#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');

// this is a declarative controller
// takes a manifest and translates into iterative API calls against engine

async function main() {
	try {
		// get product index
		//let schema = await fractal.getSchema();
		let schema = require('./model.json');

		schema.nodes.forEach((node) => {
			console.log('Creating node at [' + node.grid.x + ' : ' + node.grid.y + ']');
			//node.tags = [];
			fractal.nodesCreate(node);
		});

		console.log(JSON.stringify(schema, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
};

main();

