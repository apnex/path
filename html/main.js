import ky from './ky.min.js';

console.log('main-start');
var el = document.getElementById("main");
var two = new Two({
	fullscreen: true
});
two.appendTo(el);

// global variables - fix somewhere else
var nodeIndex = {};
var pathIndex = {};
var tagIndex = {};

// groups
var gSystem = two.makeGroup();
var gPaths = two.makeGroup();
var gNodes = two.makeGroup();
var gText = two.makeGroup();

// default css style - convert to managed entity
var css = {
	'text': {
		'fill': '#ffffff',
		'family': 'monospace',
		'weight': 500,
		'size': 12
	}
};
var nodeStyle = {
	'width': 20,
	'height': 20,
	'radius': 4
};
var gridStyle = {
	'padding': 10,
	'size': 20
};

// Z-axis
gSystem.add(gPaths);
gSystem.add(gNodes);
gSystem.add(gText);

// calc raw position
function getPosition(current, increment) {
	return {
		x: 0,
		y: current + increment
	};
}

// calc grid position
function getGridPosition(x, y) {
	return {
		x: (x * gridStyle.size) + (x * gridStyle.padding),
		y: (y * gridStyle.size) + (y * gridStyle.padding)
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
		if(nodeIndex[item.id] === undefined) {
			console.log('Creating node[' + item.id + ']');
			let node = {
				'id': item.id,
				'width': nodeStyle.width,
				'height': nodeStyle.height,
				'radius': nodeStyle.radius,
				'grid': {
					x: item.grid.x,
					y: item.grid.y
				},
				'tags': item.tags,
				'status': item.status
			};
			let nodeObj = two.makeRoundedRectangle(0, 0, node.width, node.height, node.radius);
			nodeObj.linewidth = 2;
			nodeObj.stroke = "#eeeeff";
			nodeObj.fill = "#" + item.id;
			node['object'] = nodeObj;

			// create text
			var nodeText = two.makeText(node.tags[0], 0, 0, {
				alignment: 'middle'
			});
			node['text'] = nodeText;

			// update indices and register node to scene
			nodeIndex[node.id] = node;
			gNodes.add(nodeObj);
			gText.add(nodeText);
		} else {
			if(nodeIndex[item.id].status != item.status) {
				console.log('Updated status node[' + item.id + ']');
				nodeIndex[item.id].status = item.status;
			}
		}
	});

	// Update tag index - temp - work out incremental add/delete
	tagIndex = {};
	Object.values(nodeIndex).forEach((item) => {
		tagIndex[item.tags[0]] = item;
	});
}

// Path construction
function buildPaths(apiCache) {
	// iterate cache
	Object.values(apiCache).forEach((item) => {
		// check and construct construct node
		if(pathIndex[item.id] === undefined) {
			// resolve endpoints << move server side resolution
			let srcObj;
			let dstObj;
			if(item.route[0].length == 1) { // if tag
				srcObj = tagIndex[item.route[0]];
			} else {
				srcObj = nodeIndex[item.route[0]];
			}
			if(item.route[0].length == 1) { // if tag
				dstObj = tagIndex[item.route[1]];
			} else {
				dstObj = nodeIndex[item.route[1]];
			}

			// check and create if valid - check status 'valid' instead
			if(srcObj != undefined && dstObj != undefined && item.status == 'valid') {
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
	Object.values(nodeIndex).forEach((node) => {
		if(apiCache[node.id] === undefined) {
			console.log('Deleting node[' + node.id + ']');
			delete nodeIndex[node.id];
			gNodes.remove(node.object);
			gText.remove(node.text);
		}
	});
}

function clearPaths(apiCache) {
	Object.values(pathIndex).forEach((item) => {
		if(apiCache[item.id] === undefined || item.status == 'invalid') {
			console.log('Deleting path[' + item.id + ']');
			delete pathIndex[item.id];
			gPaths.remove(item.object);
		}
	});
}

async function apiLoop() { // main loop iteration - called from two.update
	console.log('Called apiLoop, resolving model.. ');

	// resolve model
	return getSchema().then((schema) => {
		checkNodes(schema.nodes);
		checkPaths(schema.paths);
		return 'apiLoop complete';
	});
}

function checkNodes(nodes) {
	let apiCache = {};
	nodes.forEach((item) => {
		apiCache[item.id] = item;
	});
	clearNodes(apiCache); // delete stale nodes
	buildNodes(apiCache); // create missing nodes
}

function checkPaths(paths) {
	let apiCache = {};
	paths.forEach((item) => {
		apiCache[item.id] = item;
	});
	clearPaths(apiCache); // delete stale paths
	buildPaths(apiCache); // create missing paths
}

function renderLoop(frameCount) {
	let gridSize = {
		x: 0,
		y: 0
	};
	Object.values(nodeIndex).forEach((item) => {
		// update node position
		let pos = getGridPosition(item.grid.x, item.grid.y);
		let node = item.object;
		node.translation.x = pos.x;
		node.translation.y = pos.y;

		// update text position -- change to be part of node group
		let text = item.text;
		text.translation.x = pos.x;
		text.translation.y = pos.y;

		// update node style
		if(item.status == 'selected') {
			node.linewidth = 6;
			node.stroke = "#eeffee";
		} else {
			node.linewidth = 2;
			node.stroke = "#eeeeff";
		}

		// update text style
		// convert logic to refer to css managed entity instead of static
		text.fill = '#ffffff';
		text.family = 'monospace';
		text.weight = 600;
		text.size = 14;

		// update counters
		if(gridSize.x < Number(item.grid.x)) {
			gridSize.x = item.grid.x;
		}
		if(gridSize.y < Number(item.grid.y)) {
			gridSize.y = item.grid.y;
		}
	});

	// update grid center translation
	console.log('gridsize');
	console.log(gridSize);
	let gridPos = getGridPosition(gridSize.x, gridSize.y);
	let shiftGroup = {
		x: -(gridPos.x / 2),
		y: -(gridPos.y / 2),
	};
	gNodes.translation.set(shiftGroup.x, shiftGroup.y);
	gText.translation.set(shiftGroup.x, shiftGroup.y);
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
