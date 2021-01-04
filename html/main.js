import ky from './ky.min.js';

console.log('moo');
var el = document.getElementById("main");
var two = new Two({
	fullscreen: true
});
two.appendTo(el);

// global variables - fix somewhere else
var pIndex = {};

// groups
var gSystem = two.makeGroup();
var gPorts = two.makeGroup();
var gLinks = two.makeGroup();

// Z-axis
gSystem.add(gPorts);
gSystem.add(gLinks);

// calc raw position
function getPosition(current, increment) {
	return {
		x: 0,
		y: current + increment
	};
}

// calc grid position
function getGridPosition(x, y) {
	let padding = 10;
	let size = 40;
	return {
		x: (x * size),
		y: (y * size)
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
				'radius': 5,
				'grid': {
					x: item.grid.x,
					y: item.grid.y
				}
			};
			let port = two.makeRoundedRectangle(0, 0, node.width, node.height, node.radius);
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

	let distance = 40;
	let padding = 10;
	let gridSize = {
		x: 0,
		y: 0
	};
	Object.values(pIndex).forEach((item) => {
		// update node position
		//let pos = getPosition(currentDist, distance + padding);
		let pos = getGridPosition(item.grid.x, item.grid.y);
		let node = item.object;
		node.translation.x = pos.x;
		node.translation.y = pos.y;

		// update node style
		//node.linewidth += 1;
		//node = "#aaaaff";
		//node.fill = "#" + item.id;

		// update counters
		//currentDist = pos.y;
		//distance = 40;
		//padding = 10;
		if(gridSize.x < item.grid.x) {
			gridSize.x = item.grid.x;
		}
		if(gridSize.y < item.grid.y) {
			gridSize.y = item.grid.y;
		}
	});

	// update group translation
	console.log(JSON.stringify(gridSize, null, "\t"));
	let shiftGroup = {
		x: -(gridSize.x * distance / 2),
		y: -(gridSize.y * distance / 2)
	};
	console.log(JSON.stringify(shiftGroup, null, "\t"));
	gPorts.translation.set(shiftGroup.x, shiftGroup.y);
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
});
two.bind('resize', () => {
	center.x = two.width / 2;
	center.y = two.height / 2;
	gSystem.translation.x = center.x;
	gSystem.translation.y = center.y;
})

// center
var center = {
	x: two.width / 2,
	y: two.height / 2
};
gSystem.translation.set(center.x, center.y);
two.play();
