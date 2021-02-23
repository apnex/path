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
var schema = {};

// bind layout
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
