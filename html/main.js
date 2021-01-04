import ky from './ky.min.js';

console.log('moo');
var el = document.getElementById("main");
var two = new Two({
	fullscreen: true
});
two.appendTo(el);

// anchor
var center = {
	x: two.width / 2,
	y: two.height / 2
};

// groups
var gSystem = two.makeGroup();
var gPorts = two.makeGroup();
var gLinks = two.makeGroup();

// Z-axis
gSystem.add(gPorts);
gSystem.add(gLinks);
gSystem.translation.set(center.x, center.y);

// calc position on orbit
function getPosition(current, increment) {
	return {
		x: 100,
		y: current + increment
	};
}

// Returns a Promise that resolves after "ms" Milliseconds
function msleep(ms) {
	return new Promise((response) => {
		setTimeout(response, ms)
	});
}

// Get items from API server
async function getPorts() {
	return await ky.get('/ports').json();
}

// global variables - fix somewhere else
var distance = 40;
var padding = 10;
var currentDist = 0;
var pIndex = {};

function buildPorts(apiCache) { // object construction
	// iterate cache
	Object.values(apiCache).forEach((item) => {
		// check and construct construct node
		if(pIndex[item.id] === undefined) {
			console.log('Creating [' + item.id + ']');
			let node = {
				'id': item.id,
				'width': 40,
				'height': 40,
				'radius': 5
			};
			let pos = getPosition(currentDist, distance + padding);
			let port = two.makeRoundedRectangle(pos.x, pos.y, node.width, node.height, node.radius);
			port.linewidth = 4;
			port.stroke = "#aaaaff";
			port.fill = "#" + item.id;
			node['object'] = port;

			// register node
			pIndex[node.id] = node;
			gPorts.add(port);
		}
	});
}

function clearNodes(apiCache) {
	// delete ports
	Object.values(pIndex).forEach((node) => {
		if(apiCache[node.id] === undefined) {
			console.log('Deleting [' + node.id + ']');
			delete pIndex[node.id];
			gPorts.remove(node.object);
		}
	});
}

async function apiLoop() { // main loop iteration - called from play()
	console.log('Called apiLoop, getting ports.. ');

	// build ports
	return getPorts().then((data) => {
		let apiCache = {};
		data.items.forEach((item) => {
			apiCache[item.id] = item;
		});
		clearNodes(apiCache); // delete stale nodes
		buildPorts(apiCache); // create missing nodes
		return 'apiLoop complete';
	});
}

function renderLoop(frameCount) {
	console.log('Called renderLoop, drawing ports.. ');

	let currentDist = 0;
	let distance = 40;
	let padding = 0;
	Object.values(pIndex).forEach((node) => {
		let pos = getPosition(currentDist, distance + padding);
		//port.linewidth = 4;
		//port.stroke = "#aaaaff";
		//port.fill = "#" + item.id;
		node.object.translation.x = pos.x;
		node.object.translation.y = pos.y;

		// test
		currentDist = pos.y;
		padding = 10;
	});
}

var drawOnce = 1;
var apiCounter = 0
var apiInterval = 1000
var renderCounter = 0;
var renderInterval = 1000
two.bind("update", async(frameCount, timeDelta) => {

	// apiInterval
	if(typeof(timeDelta) != 'undefined') {
		apiCounter += timeDelta;
	}
	if(apiCounter > apiInterval) { // called every 2 seconds
		apiCounter = 0
		await apiLoop();
	}

	// renderInterval
	if(typeof(timeDelta) != 'undefined') {
		renderCounter += timeDelta;
	}
	if(renderCounter > renderInterval) { // called every 2 seconds
		renderCounter = 0
		await renderLoop();
	}

	//renderLoop(frameCount); // called every frame @ 60 fps

	// get /bodies
	// create a frame counter = to track increments of 60 frames (i.e 1 second)
	// call mainLoop();
	// forEach body { // hard sync to API
	//	body.object.translation.x = bodyPos.x;
	//	body.object.translation.y = bodyPos.y;
	// }
	// separate renderLoop(1/frame) from apiLoop(1/180 frames)

});
two.bind('resize', () => {
	gSystem.translation.x = two.width / 2;
	gSystem.translation.y = two.height / 2;
})

two.play();
