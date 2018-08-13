/*
*
*Primary App file that intiates server and workers; 
*/

//dependencies
var server = require('./lib/server'); 
var workers = require('./lib/workers'); 

//app container; 
var app = {}; 

app.init = ()=>{

	//start the server
	server.init(); 

	//start background workers; 
	workers.init(); 
}

//start the app;
app.init(); 

//export app; 
module.exports = app; 