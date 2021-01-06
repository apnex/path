import ky from './ky.min.js';

console.log('main-start');
var el = document.getElementById("main");
var two = new Two({
	fullscreen: true
});
two.appendTo(el);

// global variables - fix somewhere else
var pIndex = {};
var nodeIndex = {};
var pathIndex = {};

// groups
var gSystem = two.makeGroup();
var gNodes = two.makeGroup();
var gPaths = two.makeGroup();

// Z-axis
gSystem.add(gNodes);
gSystem.add(gPaths);

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

// Get schema from API server
async function getSchema() {
	return await ky.get('/schema').json();
}

// Node construction
function buildNodes(apiCache) {
	// iterate cache
	Object.values(apiCache).forEach((item) => {
		// check and construct construct node
		if(pIndex[item.id] === undefined) {
			console.log('Creating node[' + item.id + ']');
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
				console.log('Updated status node[' + item.id + ']');
				pIndex[item.id].status = item.status;
			}
		}
	});
}

// Path construction
function buildPaths(apiCache) {
	// iterate cache
	Object.values(apiCache).forEach((item) => {
		// check and construct construct node
		if(pathIndex[item.id] === undefined) {
			// resolve endpoints
			let srcObj = pIndex[item.route[0]];
			let dstObj = pIndex[item.route[1]];

			// check and create if valid
			if(srcObj != undefined && dstObj != undefined) {
				console.log('Creating path[' + item.id + ']');
				let path = {
					'id': item.id,
					'route': item.route,
					'status': item.status
				};

				let srcPos = getGridPosition(srcObj.grid.x, srcObj.grid.y);
				let dstPos = getGridPosition(dstObj.grid.x, dstObj.grid.y);

				// build path
				let pathObj = two.makeLine(srcPos.x, srcPos.y, dstPos.x, dstPos.y);
				pathObj.linewidth = 6;
				pathObj.stroke = "#ddffdd";
				path['object'] = pathObj;

				// register node to scene
				pathIndex[path.id] = path;
				gPaths.add(pathObj);
			}
		} else {
			if(pathIndex[item.id].status != item.status) {
				console.log('Updated status path[' + item.id + ']');
				pathIndex[item.id].status = item.status;
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

function clearPaths(apiCache) {
	// delete paths
	Object.values(pathIndex).forEach((item) => {
		if(apiCache[item.id] === undefined) {
			console.log('Deleting path[' + item.id + ']');
			delete pathIndex[item.id];
			gPaths.remove(item.object);
		}
	});
}

async function apiLoop() { // main loop iteration - called from play()
	console.log('Called apiLoop, getting nodes.. ');

	// build ports
	return getSchema().then((schema) => {
		// resolve nodes
		let apiNodeCache = {};
		schema.nodes.forEach((item) => {
			apiNodeCache[item.id] = item;
		});
		clearNodes(apiNodeCache); // delete stale nodes
		buildNodes(apiNodeCache); // create missing nodes

		// resolve paths
		let apiPathCache = {};
		schema.paths.forEach((item) => {
			apiPathCache[item.id] = item;
		});
		clearPaths(apiPathCache); // delete stale paths
		buildPaths(apiPathCache); // create missing paths
		return 'apiLoop complete';
	});
}

function renderLoop(frameCount) {
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

	// update grid center translation
	let gridPos = getGridPosition(gridSize.x, gridSize.y);
	let shiftGroup = {
		x: -(gridPos.x / 2),
		y: -(gridPos.y / 2),
	};
	gNodes.translation.set(shiftGroup.x, shiftGroup.y);
	gPaths.translation.set(shiftGroup.x, shiftGroup.y);
}

var apiCounter = 0
var apiInterval = 1000
var renderCounter = 0;
var renderInterval = 1000
var center = {
	x: two.width / 2,
	y: two.height / 2
};
two.bind("update", async(frameCount, timeDelta) => {

	// apiInterval
	if(typeof(timeDelta) != 'undefined') {
		apiCounter += timeDelta;
	}
	if(apiCounter > apiInterval) { // called every 1 second
		apiCounter = 0
		await apiLoop();
	}

	// renderInterval
	if(typeof(timeDelta) != 'undefined') {
		renderCounter += timeDelta;
	}
	if(renderCounter > renderInterval) { // called every 1 second
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
gSystem.translation.set(center.x, center.y);
two.play();
