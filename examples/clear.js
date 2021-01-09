#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');

// this is a declarative controller
// takes a manifest and translates into iterative API calls against engine

async function main() {
	try {
		console.log('Clearing all nodes... ');
		fractal.clearNodes();
		console.log('Clearing all paths... ');
		fractal.clearPaths();
	} catch (error) {
		console.log(error.message);
	}
};

main();

