/*
* this part handles request and bootstrap route  with handler; 
*/

//dependencies
var router = require('./routes'); 
var url = require('url'); 
var helpers = require('./helper'); 
var StringDecoder = require('string_decoder').StringDecoder; 
var util = require('util'); 
var debug = util.debuglog('express'); //for debugging purposes otherwise hide those logs from the user;

//route all req and res from server to router; 

module.exports = (req, res)=>{
	//Get the url from request and parse it; 
	var parsedUrl = url.parse(req.url, true); 

	//Get pathName from the url
	var pathName = parsedUrl.pathname; 

	//Get trimmed path from pathName; 
	var trimmedPath = pathName.replace(/^\/+|\/+$/g, ''); 

	//Get method 
	var method = req.method.toUpperCase(); 

	//Get query
	var query = parsedUrl.query; 

	//Get headers
	var headers = req.headers; 

	//Get Request payload
	var decoder = new StringDecoder('utf-8');
	var buffer = ''; 

	//Append payload request to buffer
	req.on('data', (data)=>{
		buffer += decoder.write(data); 
	}); 

	//Start your logic on req end and stop the buffer; 
	req.on('end', ()=>{
		buffer += decoder.end(); 

		//choose the handler and execute the cb; 
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router['notFound'];

		//parse buffer string to json object; 
		var payload = helpers.parseJsonToObject(buffer); 

		//construct the data object and send to handler; 
		var data = {
			'queryString': query,
			'method': method,
			'trimmedPath': trimmedPath,
			'payload': payload,
			'headers': headers
		}
		
		chosenHandler(data, (statusCode, payload)=>{
			//use statuscode from handler or default to 200; 
			var statusCode = typeof(statusCode) =='number' ?statusCode : 200; 

			//user payload or revert to {}; 
			var payload = typeof(payload) == 'object' ? payload : {}; 

			//stringify payload; 
			var payloadString = JSON.stringify(payload); 

			//set headers to res as content type to application json
			res.setHeader('Content-Type', 'application/json'); 
			res.writeHead(statusCode); 

			//send the payload
			res.end(payloadString); 

			if(statusCode == 200){
				//alert console in green; 
				debug('\x1b[32m%s\x1b[0m','Request '+method.toUpperCase()+' received on path '+trimmedPath+' with status code '+ statusCode); 
			}
			else if (statusCode == 500){
				//alert console in red danger; 
				debug('\x1b[31m%s\x1b[0m','Request '+method.toUpperCase()+' received on path '+trimmedPath+' with status code '+ statusCode); 
			}else{
				//alert in yellow; 
				debug('\x1b[35m%s\x1b[0m','Request '+method.toUpperCase()+' received on path '+trimmedPath+' with status code '+ statusCode); 
			}
			
		});  
	}); 
}
