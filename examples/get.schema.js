#!/usr/bin/env node
const client = require('./sdk');
const fractal = new client();

(async() => {
	try {
		// get product index
		let schema = await fractal.getSchema();

		console.log(JSON.stringify(schema, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
})();

