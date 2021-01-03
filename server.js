#!/usr/bin/env node
const app = require('./app');
'use strict';

// get environment variable
var port = 4040;
if(process.env.PROBE_SERVER_PORT) {
	port = process.env.PROBE_SERVER_PORT;
}

// start server
app.listen(port, () => {
	console.log('Express server listening on port ' + port);
});
