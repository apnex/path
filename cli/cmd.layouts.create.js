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
if(process.argv[1].match(/layouts.create/g)) {
	if(args.length > 0) {
		main({
			name: args[0],
			body: {
				x: 20,
				y: 20
			}
		});
	} else {
		renderLog({
			code: 404,
			level: 'ERROR',
			message: 'layouts.create <layout.name>'
		});
	}
}

async function main(body) {
	fractal.layoutsCreate(body).then((item) => {
		console.log('Created layout [ ' + blue(item.id) + ' ]');
	}).catch((error) => {
		renderLog(error.body);
	});
};

function renderLog(log) {
	console.log('[ ' + orange(log.level) + ' ]: command usage: [ ' + blue(log.message) + ' ]');
}
