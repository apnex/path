#!/usr/bin/env node
const os = require("os");
/*
	Provides direct interface against fractal API
*/

module.exports = class path {
	constructor(options = {}) {
		this.options = options;
	}
	bind(app, entity, state = {}) {
		console.log('entity [' + entity + '] registered');
		if(!state[entity]) {
			state[entity] = [];
		}
		let route = '/' + entity;

		// create
		app.post(route, (req, res) => {
			console.log('[ POST ] ' + route);
			let item = this.create(req.body);
			console.log('[ ' + item.id + ' ] created');
			state[entity].push(item);
			res.status(200).send(item);
		});

		// delete
		app.delete(route + '/:itemId', (req, res) => {
			let itemId = req.params.itemId;
			console.log('[ DELETE ] ' + route + '/' + itemId);
			state[entity] = state[entity].filter((item) => {
				return (item.id != itemId);
			}); // remove
			res.status(200).send({
				message: entity + " [ " + itemId + " ] deleted"
			});
		});

		// clear
		app.post(route + '/clear', (req, res) => {
			console.log('[ POST ] ' + route + '/clear');
			state[entity] = [];
			res.status(200).send({
				message: "All " + entity + " cleared"
			});
		});

		// list
		app.get(route, (req, res) => {
			console.log('[ GET ] ' + route);
			var hostname = os.hostname();
			let items = {
				server: {
					name: hostname,
					address: req.headers.host
				},
				items: state[entity]
			};
			res.status(200).send(items);
		});
	}
	create(body) {
		// normalise tags
		let tags = [];
		if(Array.isArray(body.tags) && body.tags.length > 0) {
			tags.unshift(...body.tags);
		}

		// generate new item
		let item = {
			id: Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
			route: body.route,
			closed: body.closed,
			tags: tags,
			status: "unknown"
		};
		return item;
	}
}
