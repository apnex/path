#!/usr/bin/env node
//'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const os = require("os");

// initialise express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var data = [];

// implement a grid
let grid = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
];

// create a port
app.post('/ports', (req, res) => {
	console.log('[ POST ] /ports');
	console.log(JSON.stringify(req.body, null, "\t"));

	// generate new id
	// create node
	let node = {
		id: Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
		grid: req.body.grid,
		status: "unknown"
	};
	console.log(JSON.stringify(node, null, "\t"));
	data.push(node);
	console.log('[ ' + node.id + ' ] created');

	res.status(200).send(node);
});

app.get('/ports', (req, res) => {
	console.log('[ GET ] /ports');
	var hostname = os.hostname();
	let items = {
		server: {
			name: hostname,
			address: req.headers.host
		},
		items: data
	};
	res.status(200).send(items);
});

app.get('/ports/:portId', (req, res) => {
	let portId = req.params.portId;
	console.log('[ GET ] /ports/' + portId);
	let port = data.filter((item) => {
		return (item.id == portId);
	})[0];
	res.status(200).send(port);
});

app.delete('/ports/:portId', (req, res) => {
	let portId = req.params.portId;
	console.log('[ DELETE ] /ports/' + portId);

	data = data.filter((item) => {
		return (item.id != portId);
	}); // remove
	console.log(JSON.stringify(data, null, "\t"));
	res.status(200).send({
		message: "port [ " + portId + " ] deleted"
	});
});

app.get('/favicon.ico', (req, res) => {
	res.status(200).send({});
});

// Serve static html files
app.use('/', express.static(path.join(__dirname, 'html')))
module.exports = app;
