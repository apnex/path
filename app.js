#!/usr/bin/env node
//'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const os = require("os");

// initialise app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// make tree based state model
/*
// build and nest nodes
// bind a blob of data to each node
// limit and filter methods and data access
// forms a modular sdk
// can be compiled to declarative json definition
// nested state updated automatically
// store as hash natively, list() returns an array

root
	layouts
	paths
	nodes

let root = new node();
let layouts = root.add({
	id: 'layouts',
	data: new (require('./entities/layout.js'))(),
	methods: ['create', 'delete', 'get', 'clear', 'list']
});
let paths = root.add({
	id: 'paths',
	data: new (require('./entities/path.js'))(),
	methods: ['create', 'delete', 'get', 'clear', 'list']
});
let nodes = root.add({
	id: 'nodes',
	data: new (require('./entities/node.js'))(),
	methods: ['create', 'delete', 'get', 'clear', 'list']
});

// model definition tree
root.tree();
root.tree().nodes;

// model sdk invocation
root.cmd.nodes.list();
root.cmd.nodes.create();

// model sdk instantiation
root.nodes.create({
	name: 'node1'
});
root.nodes['node1'].get();
root.nodes.node1.get();
root.nodes.node1.delete();

root.raw.paths.create();

// need to work out difference between 'model' and 'state' of the model
root.model.list();
root.state.list(depth, filter).map((item) => {
	app.post(item.path, (req, res) => {
		console.log('[ POST ] ' + item.path);
		let item = item.data.create(req.body);
		console.log('[ ' + item.id + ' ] created');
		state[entity].push(item);
		res.status(200).send(item);
	});
});
*/

// bind layout
var schema = {};
const crdlayout = new (require('./entities/layout.js'))();
crdlayout.bind(app, 'layouts', schema);

// bind path
const crdpath = new (require('./entities/path.js'))();
crdpath.bind(app, 'paths', schema);

// bind node
const crdnode = new (require('./entities/node.js'))();
crdnode.bind(app, 'nodes', schema);

// retrieve all data
app.get('/schema', (req, res) => {
	console.log('[ GET ] /schema');

	var hostname = os.hostname();
	let items = {
		server: {
			name: hostname,
			address: req.headers.host
		},
		layouts: schema.layouts,
		nodes: schema.nodes,
		paths: schema.paths
	};

	res.status(200).send(items);
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
