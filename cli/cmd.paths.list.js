#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');
const xtable = require('./xtable');

// this is a declarative controller
// takes a manifest and translates into iterative API calls against engine

// called from shell
const args = process.argv.splice(2);
if(process.argv[1].match(/paths.list/g)) {
	main();
}

// main
async function main(pos) {
	try {
		fractal.pathsList().then((schema) => {
			let data = schema.items.map((path) => {
				return {
					id: path.id,
					status: path.status,
					route: path.route.join(',')
				};
			});
			let table = new xtable({data});
			table.run().out([
				'id',
				'status',
				'route'
			]);

		});
	} catch (error) {
		console.log(error.message);
	}
};
