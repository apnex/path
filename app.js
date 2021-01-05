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

// implement an external grid module for placement?
// integrate grid as first-class API objcet
var grid = {};
var selected = [];

// create a node
app.post('/nodes', (req, res) => {
	console.log('[ POST ] /nodes');
	console.log(JSON.stringify(req.body, null, "\t"));

	// generate new node
	let node = {
		id: Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
		grid: req.body.grid,
		status: "unknown"
	};
	console.log(JSON.stringify(node, null, "\t"));
	data.push(node);
	let gridKey = node.grid.x + ':' + node.grid.y;
	if(grid[gridKey] === undefined) {
		grid[gridKey] = [];
	}
	grid[gridKey].push(node.id);
	console.log('[ ' + node.id + ' ] created');

	res.status(200).send(node);
});

app.get('/nodes', (req, res) => {
	console.log('[ GET ] /nodes');

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

app.get('/grids/default/cells/:cellId', (req, res) => {
	let cellId = req.params.cellId;
	console.log('[ GET ] /grids/default/cells/' + cellId);

	let node = grid[cellId];
	console.log('test: ' + cellId);
	console.log(JSON.stringify(node, null, "\t"));

	res.status(200).send(node);
});

app.get('/nodes/:nodeId', (req, res) => {
	let nodeId = req.params.nodeId;
	console.log('[ GET ] /nodes/' + nodeId);

	let node = data.filter((item) => {
		return (item.id == nodeId);
	})[0];

	res.status(200).send(node);
});

app.post('/nodes/:nodeId/select', (req, res) => {
	let nodeId = req.params.nodeId;
	console.log('[ POST ] /nodes/' + nodeId + '/select');

	//console.log(JSON.stringify(req.body, null, "\t"));
	data.forEach((node) => {
		if(node.id == nodeId) {
			if(selected.length > 1) {
				let oldNodeId = selected.shift();
				data.filter((item) => {
					return (item.id == oldNodeId);
				})[0].status = 'unknown';
			}
			node.status = 'selected'; // change so status is inherited from "selected" state
			selected.push(node.id);
		}
	});
	console.log(selected);

	res.status(200).send({
		message: "node [ " + nodeId + " ] selected"
	});
});

app.delete('/nodes/:nodeId', (req, res) => {
	let nodeId = req.params.nodeId;
	console.log('[ DELETE ] /nodes/' + nodeId);

	data = data.filter((item) => {
		let gridKey = item.grid.x + ':' + item.grid.y;
		delete grid[gridKey];
		return (item.id != nodeId);
	}); // remove
	console.log(JSON.stringify(data, null, "\t"));

	res.status(200).send({
		message: "port [ " + nodeId + " ] deleted"
	});
});

app.get('/favicon.ico', (req, res) => {
	res.status(200).send({});
});

// Serve static html files
app.use('/', express.static(path.join(__dirname, 'html')))
module.exports = app;
