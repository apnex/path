#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();
const fs = require('fs');

/*
	this is an atomic CLI action
	takes shell args and fires an SDK call
*/

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
const args = process.argv.splice(2);
if(process.argv[1].match(/layouts.delete/g)) {
	main(args[0]);
}

async function main(id) {
	fractal.layoutsDelete(id).catch((error) => {
		renderLog(error.body);
	});
};

function renderLog(log) {
	console.log('[ ' + orange(log.level) + ' ]: command usage: [ ' + blue(log.message) + ' ]');
}
