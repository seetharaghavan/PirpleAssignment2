/*
* Server file with router module; 
*/

//dependencies
var http = require('http');
var https = require('https'); 
var fs = require('fs'); 
var path = require('path'); 
var url = require('url'); 
var config = require('./config'); 
var express = require('./express'); 
 

//Server container; 
var server = {}; 

//unified server ; 
server.unifiedServer = express; 

//Instantiate httpServer 
server.httpServer = http.createServer((req, res)=>{
	server.unifiedServer(req, res); 
}); 

//Instantiate httpsServer config
server.httpsServerOptions = {
	'cert': fs.readFileSync(path.join(__dirname + '/../certs/cert.pem')), 
	'key': fs.readFileSync(path.join(__dirname + '/../certs/key.pem'))
}
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res)=>{
	server.unifiedServer(req, res); 
}); 

//init server runs instance of http and https;
server.init = ()=>{
	//starting http server
	server.httpServer.listen(config.httpPort, (req, res)=>{
		console.log('\x1b[35m%s\x1b[0m', 'Server listening on Port '+config.httpPort+' in '+config.envName+' mode!'); 
	});

	//starting secure server;
	server.httpsServer.listen(config.httpsPort, (req, res)=>{
		console.log('\x1b[36m%s\x1b[0m', 'Server listening on Port '+config.httpsPort+' in '+config.envName+' mode!'); 
	});
}

//export server
module.exports = server; 