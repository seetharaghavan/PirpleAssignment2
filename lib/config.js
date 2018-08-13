/*
*
*All system and server config variable are configured here. 
*/


//container for config module; 
var config = {}; 

//two environments staging, production. 

//staging
config.staging = {
	'httpPort': 3000,
	'httpsPort': 3001,
	'envName' : 'staging',
	'hashingSecret': 'pizzaAppSecret',
	'stripe': {
		'source': 'TEST TOKEN',
		'currency': 'usd',
		'skey'    : 'TEST SECRET KEY'
	},
	'mailgun': {
		'apiKey': 'SANDBOX API KEY',
		'domain': 'SANDBOX DOMAIN',
		'from' : 'SANDBOX EMAIL'
	},
	'workerInterval': 24 //time in hrs at which the workers should loop through; 
}

//production
config.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName': 'production',
	'hashingSecret': 'pizzaAppSecret',
	'stripe': {
		'source': 'PRODUCTION READY TOKEN',
		'currency': 'usd',
		'skey'    : 'PRODUCTION SECRET KEY'
	},
	'mailgun': {
		'apiKey': 'PRODUCTION API KEY',
		'domain': 'PRODUCTION DOMAIN',
		'from' : 'PRODUCTION EMAIL'
	},
	'workerInterval': 24 //time in hrs at which the workers should loop through;
}

//check current environment; 
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' && ['staging', 'production'].indexOf(process.env.NODE_ENV) > -1 ? process.env.NODE_ENV : 'staging'; 

var configToUse = typeof(currentEnvironment) == 'object' ? config[currentEnvironment] : config['staging']; 

module.exports = configToUse; 
