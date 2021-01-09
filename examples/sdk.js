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
	async nodesCreate(json) {
		return this.client.post('nodes', {json}).json();
	}
	async pathsCreate(json) {
		return this.client.post('paths', {json}).json();
	}
	async clearNodes(json) {
		return this.client.post('nodes/clear', {json}).json();
	}
	async clearPaths(json) {
		return this.client.post('paths/clear', {json}).json();
	}
}
