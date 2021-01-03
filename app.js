#!/usr/bin/env node
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const os = require("os");

var data = [];
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create a body
app.post('/planets', (req, res) => {
	console.log('[ POST ] /planets');
	console.log(JSON.stringify(req.body, null, "\t"));
	let name = req.body.name;
	let check = data.filter((item) => {
		return (item.name == name);
	});
	let node = {};
	if(!check.length) {
		node = {
			name: req.body.name,
			radius: req.body.radius,
			orbit: req.body.orbit,
			status: "unknown"
		};
		data.push(node);
	} else {
		console.log('[ ' + name + ' ] already exists');
	};
	res.status(200).send(node);
});

app.get('/planets', (req, res) => {
	console.log('[ GET ] /planets');
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

app.get('/planets/:planetName', (req, res) => {
	let planetName = req.params.planetName;
	console.log('[ GET ] /planets/' + planetName);
	let planet = data.filter((item) => {
		return (item.name == planetName);
	})[0];
	res.status(200).send(planet);
});

app.delete('/planets/:planetName', (req, res) => {
	let planetName = req.params.planetName;
	console.log('[ DELETE ] /planets/' + planetName);
	data = data.filter((item) => {
		return (item.name != planetName);
	}); // remove
	res.status(200).send({
		message: "planet [ " + planetName + " ] deleted"
	});
});

app.get('/favicon.ico', (req, res) => {
	res.status(200).send({});
});

// Serve static html files
app.use('/', express.static(path.join(__dirname, 'html')))

module.exports = app;
