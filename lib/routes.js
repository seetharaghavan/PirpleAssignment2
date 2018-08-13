/*
* All the routes are defined here and bootstrapped with handler
*/

//dependencies;
var handler = require('./handler'); 


//container module for routes; 
var routes = {
	'users': handler.users,
	'tokens': handler.tokens,
	'orders': handler.orders,
	'notFound': handler.notFound,
	'ping': handler.ping
}

module.exports = routes; 