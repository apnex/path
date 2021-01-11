#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');
const xtable = require('./xtable');

// this is a declarative controller
// takes a manifest and translates into iterative API calls against engine

// called from shell
const args = process.argv.splice(2);
if(process.argv[1].match(/nodes.list/g)) {
	main();
}

// main
async function main(pos) {
	try {
		fractal.nodesList().then((schema) => {
			let data = schema.items.map((item) => {
				return {
					id: item.id,
					status: item.status,
					gridx: item.grid.x,
					gridy: item.grid.y,
					tags: item.tags.join(',')
				};
			});
			let table = new xtable({data});
			table.run().out([
				'id',
				'status',
				'gridx',
				'gridy',
				'tags'
			]);

		});
	} catch (error) {
		console.log(error.message);
	}
};
