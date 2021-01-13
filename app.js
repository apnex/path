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

// implement an external grid module for placement?
// integrate grid as first-class API objcet
var schema = {
	nodes: [],
	paths: []
};
var grid = {};
var selected = [];

// Implement NODES and PATHS as discreet modules referenced here

// retrieve all data
app.get('/schema', (req, res) => {
	console.log('[ GET ] /schema');

	var hostname = os.hostname();
	let items = {
		server: {
			name: hostname,
			address: req.headers.host
		},
		nodes: schema.nodes,
		paths: schema.paths
	};

	res.status(200).send(items);
});

// create a node
app.post('/nodes', (req, res) => {
	console.log('[ POST ] /nodes');

	// normalise tags
	let tags = [];
	if(Array.isArray(req.body.tags) && req.body.tags.length > 0) {
		tags.unshift(...req.body.tags);
	}
	tags.unshift(schema.nodes.length);

	// generate new node
	let node = {
		id: Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
		grid: req.body.grid,
		tags: tags,
		status: "unknown"
	};
	console.log(JSON.stringify(node, null, "\t"));
	schema.nodes.push(node);
	let gridKey = node.grid.x + ':' + node.grid.y;
	if(grid[gridKey] === undefined) {
		grid[gridKey] = [];
	}
	grid[gridKey].push(node.id);
	console.log('[ ' + node.id + ' ] created');

	res.status(200).send(node);
});

// clear nodes
app.post('/nodes/clear', (req, res) => {
	console.log('[ POST ] /nodes/clear');
	schema.nodes = [];
	grid = [];
	selected = [];

	res.status(200).send({
		message: "All nodes cleared"
	});
});

app.get('/nodes', (req, res) => {
	console.log('[ GET ] /nodes');

	var hostname = os.hostname();
	let items = {
		server: {
			name: hostname,
			address: req.headers.host
		},
		items: schema.nodes
	};

	res.status(200).send(items);
});

// create a path
app.post('/paths', (req, res) => {
	console.log('[ POST ] /paths');

	// generate new path
	let path = {
		id: Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
		route: req.body.route,
		closed: req.body.closed,
		status: "unknown"
	};
	console.log(JSON.stringify(path, null, "\t"));
	schema.paths.push(path);
	console.log('[ ' + path.id + ' ] created');

	res.status(200).send(path);
});

app.get('/paths', (req, res) => {
	console.log('[ GET ] /paths');

	var hostname = os.hostname();
	let items = {
		server: {
			name: hostname,
			address: req.headers.host
		},
		items: schema.paths
	};

	res.status(200).send(items);
});

// clear paths
app.post('/paths/clear', (req, res) => {
	console.log('[ POST ] /paths/clear');
	schema.paths = [];

	res.status(200).send({
		message: "All paths cleared"
	});
});

app.delete('/paths/:pathId', (req, res) => {
	let pathId = req.params.pathId;
	console.log('[ DELETE ] /paths/' + pathId);

	schema.paths = schema.paths.filter((item) => {
		return (item.id != pathId);
	}); // remove

	res.status(200).send({
		message: "port [ " + pathId + " ] deleted"
	});
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

	let node = schema.nodes.filter((item) => {
		return (item.id == nodeId);
	})[0];

	res.status(200).send(node);
});

app.post('/nodes/:nodeId/select', (req, res) => {
	let nodeId = req.params.nodeId;
	console.log('[ POST ] /nodes/' + nodeId + '/select');

	//console.log(JSON.stringify(req.body, null, "\t"));
	schema.nodes.forEach((node) => {
		if(node.id == nodeId) {
			if(selected.length > 1) {
				let oldNodeId = selected.shift();
				schema.nodes.filter((item) => {
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

	schema.nodes = schema.nodes.filter((item) => {
		let gridKey = item.grid.x + ':' + item.grid.y;
		delete grid[gridKey];
		return (item.id != nodeId);
	}); // remove

	res.status(200).send({
		message: "port [ " + nodeId + " ] deleted"
	});
});

app.get('/favicon.ico', (req, res) => {
	res.status(200).send({});
});

// Serve static html files
app.use('/', express.static(path.join(__dirname, 'html')))
module.exports = {
	api: app,
	state: schema
};
