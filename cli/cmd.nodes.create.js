#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');

/*
	this is a declarative controller
	takes a manifest and translates into iterative API calls against engine
*/

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
const args = process.argv.splice(2);
if(process.argv[1].match(/nodes.create/g)) {
	if(args.length > 0) {
		let body = {};
		let rgxFilter = new RegExp('([^,:]+):([^,:]*)', 'g');
		while(m = rgxFilter.exec(args[0])) {
			if(m[1] != undefined && m[2] != undefined) {
				body.grid = {
					x: Number(m[1]),
					y: Number(m[2])
				}
			}
		}
		if(args[1] != undefined && args[1].length > 0) {
			body.tags = [ args[1] ];
		};
		console.log(JSON.stringify(body, null, "\t"));
		main(body);
	} else {
		renderLog({
			code: 404,
			level: 'MOOOT',
			message: 'nodes.create <node.pos> <node.tags>'
		});
	}
}
// validate args->input {}

async function main(body) {
	console.log(JSON.stringify(body, null, "\t"));
	fractal.nodesCreate(body).then((item) => {
		console.log('Created node at [ ' + blue(item.grid.x + ':' + item.grid.y) + ' ]');
	}).catch((error) => {
		renderLog(error.body);
	});
};

function renderLog(log) {
	console.log('[ ' + orange(log.level) + ' ]: command usage: [ ' + blue(log.message) + ' ]');
}
