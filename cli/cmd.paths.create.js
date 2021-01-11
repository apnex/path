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
if(process.argv[1].match(/paths.create/g)) {
	if(args.length > 0) {
		main({
			route: args
		});
	} else {
		renderLog({
			code: 404,
			level: 'ERROR',
			message: 'paths.create <hop1> .. <hopn>'
		});
	}
}

async function main(body) {
	fractal.pathsCreate(body).then((item) => {
		console.log('Created path via [ ' + blue(item.route.join(',')) + ' ]');
	}).catch((error) => {
		renderLog(error.body);
	});
};

function renderLog(log) {
	console.log('[ ' + orange(log.level) + ' ]: command usage: [ ' + blue(log.message) + ' ]');
}
