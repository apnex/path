#!/usr/bin/env node
const os = require("os");
/*
	Provides direct interface against fractal API
*/

module.exports = class layout {
	constructor(options = {}) {
		this.options = options;
	}
	bind(app, route, state = {}) {
		console.log('route [' + route + '] registered');
		if(!state[route]) {
			state[route] = [];
		}

		// create
		app.post(route, (req, res) => {
			console.log('[ POST ] ' + route);
			let item = this.create(req.body);
			console.log('[ ' + item.id + ' ] created');
			state[route].push(item);
			res.status(200).send(item)
		});

		// delete
		app.delete(route + '/:itemId', (req, res) => {
			let itemId = req.params.itemId;
			console.log('[ DELETE ] ' + route + '/' + itemId);
			state[route] = state[route].filter((item) => {
				return (item.id != itemId);
			}); // remove
			res.status(200).send({
				message: "layout [ " + itemId + " ] deleted"
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
				items: state[route]
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

		// generate new layout
		let item = {
			id: Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
			grid: body,
			tags: tags,
			status: "unknown"
		};
		return item;
	}
}
