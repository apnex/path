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
var gOrbits = two.makeGroup();
var gPlanets = two.makeGroup();
var gSun = two.makeGroup();
var gLinks = two.makeGroup();

// Z-axis
gSystem.add(gOrbits);
gSystem.add(gPlanets);
gSystem.add(gSun);
gSystem.add(gLinks);
gOrbits.visible = true;
gSystem.translation.set(center.x, center.y);

// return angle increment
function getAngle(seconds, frameCount) {
	let frameTotal = 60 * seconds;
	let frameCurrent = frameCount % frameTotal;
	return (360 / frameTotal) * frameCurrent * -1; // -1 to reverse direction
}

// calc position on orbit
function getPosition(angle, orbit) {
	return {
		x: Math.cos(angle * Math.PI / 180) * orbit,
		y: Math.sin(angle * Math.PI / 180) * orbit
	};
}

// scale down body radius as a square root against smallest body
function getRadius(radius, baseRadius, scale = 6) {
	return Math.sqrt(radius / baseRadius) * scale;
}

// scale down body orbit period as a square root against fastest body
function getOrbit(orbit, baseOrbit, scale = 60) {
	return Math.sqrt(orbit / baseOrbit) * scale;
}

// Returns a Promise that resolves after "ms" Milliseconds
function msleep(ms) {
	return new Promise((response) => {
		setTimeout(response, ms)
	});
}

// Get planets from API server
async function getPlanets() {
	return await ky.get('/planets').json();
}

// global variables - fix somewhere else
var baseRadius = 0;
var baseOrbit = 0;
var pStats = [];
var pIndex = {};

function buildPlanets(planets) { // planetConstruction
	console.log('Building planets..');

	// find smallest body radius
	let radiusArr = planets.map((body) => body.radius);
	baseRadius = Math.min(...radiusArr);

	// find fastest body orbit
	let orbitArr = planets.map((body) => body.orbit);
	baseOrbit = Math.min(...orbitArr);

	// make sun
	let item = {
		"name": "sun",
		"radius": 695508,
		"distance": 0,
		"orbit": 0
	};
	let sunRadius = getRadius(item.radius, baseRadius);
	let sun = two.makeCircle(0, 0, sunRadius);
	gSun.add(sun);

	// init geometry
	pStats = [];
	pIndex = {};
	let orbitDist = sunRadius;
	let orbitPadding = 14;

	planets.forEach((item) => {
		// orbit radius
		let bodyRadius = getRadius(item.radius, baseRadius);
		orbitDist += orbitPadding;
		orbitDist += bodyRadius;

		// construct orbit
		var bodyOrbit = two.makeCircle(0, 0, orbitDist);
		bodyOrbit.noFill();
		bodyOrbit.linewidth = 1;
		bodyOrbit.stroke = "#aaaaaa";
		gOrbits.add(bodyOrbit);

		// construct body
		let body = {
			'name': item.name,
			'radius': bodyRadius,
			'distance': orbitDist,
			'orbit': item.orbit
		};
		let pos = getPosition(0, body.distance);
		let planet = two.makeCircle(pos.x, pos.y, body.radius);
		body['object'] = planet;
		pStats.push(body);
		pIndex[body.name] = body;
		gPlanets.add(planet);

		orbitDist += bodyRadius;
	});
}

async function apiLoop() { // main loop iteration - called from play()
	console.log('Called apiLoop, getting planets.. ');

	// build planets
	getPlanets().then(async(data) => {
		// clear orbits
		gOrbits.children.forEach((child) => {
			child.remove();
		});
		// clear planets
		gPlanets.children.forEach((child) => {
			child.remove();
		});
		pStats = [];
		pIndex = {};
		two.update();

		console.log(gOrbits.children);
		console.log(gPlanets.children);

		await msleep(1000);

		// rebuild planets
		buildPlanets(data.items);
	});
}

function renderLoop(frameCount) { // main loop iteration - called from play()
	//console.log('Called renderLoop, drawing planets... ');
	// update bodies

	pStats.forEach((body) => {
		let orbitDuration = getOrbit(body.orbit, baseOrbit);
		let bodyPos = getPosition(getAngle(orbitDuration, frameCount), body.distance);
		body.object.translation.x = bodyPos.x;
		body.object.translation.y = bodyPos.y;
	});

	// progress drawing events
	drawingEvents.forEach((link) => {
		// get new pos x,y
		let srcPos = pIndex[link.src].object.translation;
		let dstPos = pIndex[link.dst].object.translation;

		// check if link exists
		let pLink = pLinks[link.src + '-' + link.dst];
		if(pLink != undefined) { // link exists
			// update pos x,y
			let points = pLink.vertices;
			points[0].x = srcPos.x;
			points[0].y = srcPos.y;
			points[1].x = dstPos.x;
			points[1].y = dstPos.y;
		} else { // create new link
			let line = two.makeLine(srcPos.x, srcPos.y, dstPos.x, dstPos.y);
			line.linewidth = 10;
			line.stroke = "#03a9f4";
			line.opacity = 0.5;
			pLinks[link.src + '-' + link.dst] = line;
			gLinks.add(line);
		}
	});
}

var drawingEvents = [];
var pLinks = {};
var drawOnce = 1;
var apiCounter = 0
var apiInterval = 5000
two.bind("update", async(frameCount, timeDelta) => {

	if(typeof(timeDelta) != 'undefined') {
		apiCounter += timeDelta;
	}
	if(apiCounter > apiInterval) {
		apiCounter = 0
		await apiLoop();
	}

	renderLoop(frameCount); // called every frame @ 60 fps

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

// create and register event
function clickTest(name) {
	drawingEvents.push({
		src: 'earth',
		dst: name
	});
};

// construct system and render
async function newTest() {
	await apiLoop();
	await msleep(2000);
	await apiLoop();
}

newTest();
//two.play();
