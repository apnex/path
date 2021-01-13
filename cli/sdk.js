#!/usr/bin/env node
const got = require('got');

/*
	Provides direct interface against fractal API
	Provides an ability to login
	Does not provide external auth persistence
	Does not implement caching or throttling
	Returns raw API responses, no UI rendering
*/

module.exports = class sdk {
	constructor(options = {}) {
                this.options = options;
		this.base = got.extend({ // client defaults
			mutableDefaults: true,
			followAllRedirects: true,
			https: {
				rejectUnauthorized: true
			}
		});
		this.client = this.base.extend({
			prefixUrl: 'http://localhost:4040'
		});
	}
	async getSchema() {
		return this.client.get('schema').json();
	}
	async nodesCreate(spec) {
		let json = this.buildNode(spec);
		if(json != undefined) {
			return this.client.post('nodes', {json}).json();
		} else {
			let body = {
				code: 404,
				level: 'ERROR',
				message: 'nodes.create <node.pos>'
			};
			let error = new Error(body.message);
			error.body = body;
			throw error;
		}
	}
	async nodesDelete(id) {
		if(id != undefined) {
			return this.client.delete('nodes/' + id).json();
		} else {
			let body = {
				code: 404,
				level: 'ERROR',
				message: 'nodes.delete <node.id>'
			};
			let error = new Error(body.message);
			error.body = body;
			throw error;
		}
	}
	async nodesList(json) {
		return this.client.get('nodes').json();
	}
	async pathsCreate(spec) {
		let json = this.buildPath(spec);
		if(json != undefined) {
			return this.client.post('paths', {json}).json();
		} else {
			let body = {
				code: 404,
				level: 'ERROR',
				message: 'pathsaaa.create <node.pos>'
			};
			let error = new Error(body.message);
			error.body = body;
			throw error;
		}
	}
	async pathsDelete(id) {
		if(id != undefined) {
			return this.client.delete('paths/' + id).json();
		} else {
			let error = new Error();
			error.body = {
				code: 404,
				level: 'ERROR',
				message: 'paths.delete <paths.id>'
			};
			throw error;
		}
	}
	async pathsList(json) {
		return this.client.get('paths').json();
	}
	async clearNodes(json) {
		return this.client.post('nodes/clear', {json}).json();
	}
	async clearPaths(json) {
		return this.client.post('paths/clear', {json}).json();
	}
	buildNode(json) {
		// validate node spec
		return json;
	}
	buildPath(json) {
		let lastHop = json.route[json.route.length - 1];
		if(lastHop.toLowerCase() == "z") {
			json.closed = 1;
		}
		return json;
	}
}
