import ky from './ky.min.js';

console.log('main-start');
var el = document.getElementById("main");
var two = new Two({
	fullscreen: true
});
two.appendTo(el);

// global variables - fix somewhere else
var pIndex = {};

// groups
var gSystem = two.makeGroup();
var gNodes = two.makeGroup();
var gLinks = two.makeGroup();

// Z-axis
gSystem.add(gNodes);
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
	let padding = 20;
	let size = 40;
	return {
		x: (x * size) + (x * padding),
		y: (y * size) + (y * padding)
	};
}

// Returns a Promise that resolves after "ms" Milliseconds
function msleep(ms) {
	return new Promise((response) => {
		setTimeout(response, ms)
	});
}

// Get items from API server
async function getNodes() {
	return await ky.get('/nodes').json();
}

function buildNodes(apiCache) { // object construction
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
				},
				'status': item.status
			};
			let nodeObj = two.makeRoundedRectangle(0, 0, node.width, node.height, node.radius);
			nodeObj.linewidth = 4;
			nodeObj.stroke = "#aaaaff";
			nodeObj.fill = "#" + item.id;
			node['object'] = nodeObj;

			// register node to scene
			pIndex[node.id] = node;
			gNodes.add(nodeObj);
		} else {
			if(pIndex[item.id].status != item.status) {
				console.log('Updated status [' + item.id + ']');
				pIndex[item.id].status = item.status;
			}
		}
	});
}

function clearNodes(apiCache) {
	// delete ports
	Object.values(pIndex).forEach((node) => {
		if(apiCache[node.id] === undefined) {
			console.log('Deleting [' + node.id + ']');
			delete pIndex[node.id];
			gNodes.remove(node.object);
		}
	});
}

async function apiLoop() { // main loop iteration - called from play()
	console.log('Called apiLoop, getting nodes.. ');

	// build ports
	return getNodes().then((data) => {
		let apiCache = {};
		data.items.forEach((item) => {
			apiCache[item.id] = item;
		});
		clearNodes(apiCache); // delete stale nodes
		buildNodes(apiCache); // create missing nodes
		return 'apiLoop complete';
	});
}

function renderLoop(frameCount) {
	console.log('Called renderLoop, drawing nodes.. ');

	let gridSize = {
		x: 0,
		y: 0
	};
	Object.values(pIndex).forEach((item) => {
		// update node position
		let pos = getGridPosition(item.grid.x, item.grid.y);
		let node = item.object;
		node.translation.x = pos.x;
		node.translation.y = pos.y;

		// update node style
		if(item.status == 'selected') {
			node.linewidth = 6;
			node.stroke = "#ddffdd";
		} else {
			node.linewidth = 2;
			node.stroke = "#ddddff";
		}

		// update counters
		if(gridSize.x < item.grid.x) {
			gridSize.x = item.grid.x;
		}
		if(gridSize.y < item.grid.y) {
			gridSize.y = item.grid.y;
		}
	});

	// update group center translation
	let gridPos = getGridPosition(gridSize.x, gridSize.y);
	let shiftGroup = {
		x: -(gridPos.x / 2),
		y: -(gridPos.y / 2),
	};
	gNodes.translation.set(shiftGroup.x, shiftGroup.y);
}

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
