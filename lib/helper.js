/*
*Helpers to handle tasks; 
*
*/

//dependencies; 
var crypto = require('crypto');
var config = require('./config'); 
var https = require('https'); 
var http = require('http'); 
var querystring = require('querystring'); 
var _data = require('./data'); 

//container for helpers
var helpers = {}; 


//hashpasswords; 
helpers.hash = (pwdStr)=>{
	if(typeof(pwdStr) == 'string' && pwdStr.length > 3){
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(pwdStr).digest('hex'); 
		return hash; 
	}else{
		return false; 
	}
}; 

//parseJsonToObject
helpers.parseJsonToObject = (str)=>{
		try{
				var object = JSON.parse(str); 
				return object
			}catch(e){
				return {}; 
			}
};


helpers.sendEmail = (email, subject, message, callback)=>{
	if(email){
		var payload = {
			"to": email,
			'from': config.mailgun.from,
			'subject': subject,
			'text': message
		}

		var stringpayload = querystring.stringify(payload); 

		var mailgunOptions = {
			'apiKey' : config.mailgun.apiKey,
			'domain' : config.mailgun.domain
		}

		var requestDetails = {
			'protocol': 'https:',
			'hostname': 'api.mailgun.net',
			'auth': ['api', mailgunOptions.apiKey].join(':'),
			'port' : 443,
			'method' : 'POST',
			'path': '/v3/'+mailgunOptions.domain+'/messages',
			'headers': {
				 "Content-Type": "application/x-www-form-urlencoded",
				 "Content-Length": Buffer.byteLength(stringpayload)
			}		
		}

		//instantiate the request
		var req = https.request(requestDetails, (res)=>{
			var statusCode = res.statusCode; 
			if(statusCode === 200 || statusCode === 201){
				callback(false,res); 
			}
			else{
				callback(true, res); 
			}
		}); 

		//error handler
		req.on('error', (e)=>{
			callback(true, e);
		}); 

		//add the payload
		req.write(stringpayload); 

		//end the request
		req.end(); 

	}else{
		callback('Given params are invalid / empty'); 
	}
}; 

//check is valid email
helpers.verifyEmail = (email)=>{
	if(typeof(email)=='string'){
		var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
		if(re.test(email.toLowerCase())){
			return email; 
		}else{
			return false; 
		}
	}else{
		return false; 
	}
	
}

//create random string
helpers.generateRandomString = (strlen)=>{
	var strlength = typeof(strlen) == 'number' && strlen > 0 ? strlen : false; 
	var str = ''; 
	if(strlength){
		//define all the possible characters that go into the string; 
		var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890'; 

		for(i=0; i<strlength; i++){
			//Get a random char from the range and append from it; 
			var randomChar = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length)); 
			str += randomChar; 
		}
		return str; 
	}else{
		return false; 
	}
}; 


//get all menu items; 
helpers.getAllMenuItems = (callback)=>{
	(require('./data')).list('menus', (err, fileNames)=>{
		if(!err && fileNames){
			if(typeof(fileNames) =='object' && fileNames instanceof Array && fileNames.length>0){
				var menus = []; 
				fileNames.forEach((fileName)=>{
					require('./data').read('menus', fileName, (err, fileData)=>{
						if(!err && fileData){
							menus.push(fileData); 
						}

						if(menus.length === fileNames.length){
							callback(false, menus);  
						}

					}); 
				});
			
					
			}else{
				callback(true, []); 
			}
		}else{
			callback(true, []); 
		}
	});
}

//payment gatway integration
helpers.makePayment = (amount,userId,callback)=>{
	var amount = amount.toFixed(2) * 100; 
	var currency = config.stripe.currency; 
	var source = config.stripe.source; 

	var payload = querystring.stringify(
			{
                amount,
                currency,
                source,
                description: `Payment for  ${userId}`
			}
		);

	var requestOptions = {
		'protocol': "https:",
		'method'  : "POST",
		'hostname': "api.stripe.com",
		'path': "/v1/charges",
		'headers' : {
			'Authorization': 'Bearer '+config.stripe.skey,
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(payload)
		}
	}

	var request = https.request(requestOptions, (res)=>{
		var statusCode = res.statusCode; 
		res.on('data', (data)=>{
			var paymentData = helpers.parseJsonToObject(data); 
			if(paymentData.paid && paymentData.status === 'succeeded'){
				callback(false, paymentData); 
			}else{
				callback(true, res); 
			}
		}); 
		res.on('error', (err)=>{
			callback(true, res); 
		}); 
	});

	request.write(payload); 
	request.end(); 
	request.on('error', (e)=>{
		callback(true, res); 
	});  
}

//retrieve user information with user Id; 
helpers.getUserOrders = (userId, callback)=>{
	require('./data').list('orders', (err, orders)=>{
		if(!err && typeof(orders) == 'object' && orders instanceof Array && orders.length >0){
			var i = 0;
			var orderDetails = [];  
			orders.forEach((order)=>{
				require('./data').read('orders', order, (err, orderInfo)=>{
					i += 1; 
					if(orderInfo.userEmail == userId){
						delete orderInfo.userEmail;
						orderDetails.push(orderInfo); 
					}
					if(i === orders.length){
					callback(false, orderDetails); 
					} 
				});
				
			}); 
		}else{
			callback(true, []); 								 
		}
	}); 
}



//export the helpers; 
module.exports = helpers; 