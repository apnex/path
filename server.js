#!/usr/bin/env node
const app = require('./app');
'use strict';

// get environment variable
var port = 4040;
if(process.env.EXPRESS_SERVER_PORT) {
	port = process.env.EXPRESS_SERVER_PORT;
}

// start server
app.api.listen(port, () => {
	console.log('Express server listening on port ' + port);
	mainLoop();
});

// main control loop
async function mainLoop() {
	console.log('[ SERVER ] initiating mainLoop()');
	let i = 0;
	while (true) {
		checkPaths(app.state);
		await msleep(2000);
		i++;
	}
}

function msleep(ms) {
        return new Promise((response) => {
                setTimeout(response, ms)
        });
}

function checkPaths(state) {
	// build nodeIndex
	let nodeIndex = {};
	Object.values(state.nodes).forEach((item) => {
		nodeIndex[item.id] = item;
	});

	// build tagIndex
	let tagIndex = {};
	Object.values(state.nodes).forEach((item) => {
		item.tags.forEach((tag) => {
			if(tagIndex[tag] == undefined) {
				tagIndex[tag] = [];
			}
			tagIndex[tag].push(item);
		});
	});

	// validate path route
	state.paths.forEach((path) => {
		path.hops = [];
		let hopId;
		let health = 'valid';
		path.route.forEach((hop) => {
			if(hop.toString().length < 6) { // if tag
				// grabbing first hop entry in array only, need to fix logic here
				node = tagIndex[hop][0];
			} else {
				node = nodeIndex[hop];
			}
			if(node != undefined) {
				path.hops.push(node.id);
			} else {
				health = 'invalid';
			}
		});
		path.status = health;
	})
}
