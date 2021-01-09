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
		tagIndex[item.tags[0]] = item;
	});
	//console.log(JSON.stringify(tagIndex, null, "\t"));

	// check if paths valid
	//console.log('[ SERVER ] this is a paths status check');
	/*state.paths.forEach((item) => {
		let srcObj;
		let dstObj;
		if(item.route[0].length < 6) { // if tag
			srcObj = tagIndex[item.route[0]];
		} else {
			srcObj = nodeIndex[item.route[0]];
		}
		if(item.route[1].length < 6) { // if tag
			dstObj = tagIndex[item.route[1]];
		} else {
			dstObj = nodeIndex[item.route[1]];
		}
		if(srcObj != undefined && dstObj != undefined) {
			item.status = 'valid';
			item.hops = [
				srcObj.id,
				dstObj.id
			];
		} else {
			item.status = 'invalid';
		}
	});*/

	state.paths.forEach((path) => {
		path.hops = [];
		let hopId;
		let health = 'valid';
		path.route.forEach((hop) => {
			if(hop.toString().length < 6) { // if tag
				node = tagIndex[hop];
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
