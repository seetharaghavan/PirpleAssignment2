/*
* Request Handler to be bootstrapped with routes for handling all the requests
*
*/

//dependencies; 
var _data = require('./data'); 
var helpers = require('./helper'); 
var config = require('./config'); 
var _logs = require('./logs'); 

//container for handler object
var handler = {}; 

//hanlder methods

//for user methods
handler.users = (data, cb)=>{
	var allowedMethods = ['post', 'get', 'put', 'delete']; 
	if(allowedMethods.indexOf(data.method.toLowerCase()) >-1){
		handler._users[data.method.toLowerCase()](data, cb); 
	}else{
		cb(405); 
	}
}; 

//private methods for users (post, get, put, delete, list); 
handler._users = {};


//save user
handler._users['post'] = (data, callback)=>{
	//firstname, lastname, phone, tos, mandatory fields
	//optional none;
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 2 ? data.payload.firstName.trim().toLowerCase() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 2 ? data.payload.lastName.trim().toLowerCase() : false;	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 3 ? data.payload.password.trim() : false;
	var email = helpers.verifyEmail(data.payload.email);
	var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length>5 ? data.payload.address.trim(): false; 
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length >3 ? data.payload.password.trim(): false; 
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	if(firstName && lastName && password && tosAgreement && email && address){
		//making sure user doesn't exist
		_data.read('users', email, (err, fileData)=>{
			if(err){
				var hashedPassword = helpers.hash(password); 

				//create user object
				var userObj = {
					firstName: firstName,
					lastName: lastName,
					hashedPassword: hashedPassword,
					email: email,
					address: address,
					tosAgreement: true
				}
				
				_data.create('users', email, userObj, (err)=>{
					if(!err){
						callback(200, {'Message': 'User created successfully'}); 
					}else{
						callback(500, {'Error': 'Unexpected error occured'}); 
					}
				});
			}else{
				callback(400, {'Error': 'User already exists'}); 
			}
		}); 
	}else{
		callback(400, {'Error': 'Required missing fields'});
	}
} 


//get user details
handler._users['get'] = (data, callback)=>{
	//get user phone
	var email = helpers.verifyEmail(data.queryString.email); 
	if(email){
		//get the token and validate it
		var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false; 
		if(token){
			//check the token is valid and retrieve user info; 
			handler._tokens.verifyToken(token, email, (isTokenValid)=>{
				if(isTokenValid){
					
						_data.read('users', email, (err, userData)=>{
							if(!err && userData){
								delete userData['hashedPassword'];
								//get menu items; 
								var menuItems = []; 
								helpers.getAllMenuItems((err, menus)=>{
									if(typeof(menus)=='object' && menus instanceof Array && menus.length >0){
										menuItems = menus; 
									}

									//get user order history; 
									helpers.getUserOrders(email, (err, orderInfo)=>{
										if(!err && orderInfo){
											callback(200, {'userData': userData, 'menus': menuItems, 'orderHistory': orderInfo});
										}else{
											callback(200, {'userData': userData, 'menus': menuItems, 'orderHistory': []});
										}
									});
								}); 
								
							}else{
								callback(500, {'Error': "couldn't retrieve user information"}); 
							}
						}); 
				}else{
					callback(400, {'Error': "token Expired"})
				}
			}); 
		}else{
			callback(403, {'Error': 'Invalid credentials'}); 
		}
		
	}else{
		callback(400, {'Error': 'Invalid Request'}); 
	}
}

//update user details
handler._users['put'] = (data, callback)=>{
	//check required fields; 
	var email = helpers.verifyEmail(data.queryString.email); 

	//optional fields; 
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length >1 ?data.payload.firstName : false; 
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 2 ? data.payload.lastName.trim().toLowerCase() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.length > 2 ? data.payload.password.trim(): false; 
	var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length>3 ? data.payload.address.trim(): false;

	if(firstName || lastName || password || address){
		var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false; 
		if(token){
			//check token
			handler._tokens.verifyToken(token, email, (isTokenValid)=>{
				if(isTokenValid){
					//look up for user
					_data.read('users', email, (err, userData)=>{
						if(!err && userData){
							if(firstName){
								userData.firstName = firstName;
							}
							if(lastName){
									userData.lastName = lastName;
							}
							if(password){
								userData.hashedPassword = helpers.hash(password); 
							}
							//now update the users table; 
							_data.update('users', email, userData, (err)=>{
								if(!err){
									delete userData.hashedPassword; 
									callback(200, userData); 
								}else{
									callback(500, {'Error': "Couldn't retrieve user record"}); 
								}
							}); 
						}else{
							callback(403, {'Error': 'User Record doesnt exist'}); 
						}
					}); 
				}else{
					callback(403, {'Error': 'Invalid token'}); 
				}
			}); 
		}else{
			callback(403, {'Error': 'Invalid token'}); 
		}
	}else{
		callback(400, {'Error': 'Missing rEquired fields'}); 
	}

}
//delete user details
handler._users['delete'] = (data, callback)=>{
	var email = helpers.verifyEmail(data.queryString.email); 
	if(email){
		var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false; 
		if(token){
			handler._tokens.verifyToken(token, email, (isTokenValid)=>{
				if(isTokenValid){
					_data.read('users', email, (err, userData)=>{
						if(!err && userData){
							var userOrders = typeof(userData.orders) == 'object' && userData.orders instanceof Array && userData.orders.length > 0 ? userData.orders : false; ; 
							_data.delete('users', email, (err)=>{
								if(!err){
								//delete user
								//delete the current token
								_data.delete('tokens', token, (err)=>{
								if(!err){
									//delete user order history; 
									if(userOrders){
										var i = 0; 
										userOrders.forEach((order)=>{
											_data.delete('orders', order, (err)=>{
												i++; 

												if(i == userOrders.length){
													callback(200, {'Message': 'User Removed successfully'}); 
												}
											}); 
										}); 
									} else{
										callback(200, {'Message': 'User removed successfully'}); 
									}
								}else{
									callback(500, {'Error': "Coudlnt destroy user token"}); 
								}
							}); 
						}else{
							callback(500, {'Error': "Couldn't delete the user"}); 
						}
					});
						}else{
							callback(403, {'Error': 'Couldnot retrieve user records'}); 
						}
					});  
				}else{
					callback(403, {'Error': 'Invalid token'});
				}
			}); 
		}else{
			callback(403, {'Error': 'Invalid token'}); 
		}
	}else{
		callback(400, {'Error': 'Missing fields'}); 
	}
	
}

//for token handling
handler.tokens = (data, cb)=>{
	var allowedMethods = ['post', 'get', 'put', 'delete']; 
	if(allowedMethods.indexOf(data.method.toLowerCase()) >-1){
		handler._tokens[data.method.toLowerCase()](data, cb); 
	}else{
		cb(405); 
	}
};

//private methods for token handler; 
handler._tokens = {}; 

//create a token; 
handler._tokens.post = (data, callback)=>{
	var email = helpers.verifyEmail(data.payload.email); 
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>3 ? data.payload.password : false;

	if(email && password){
		_data.read('users', email, (err, userData)=>{
			if(!err && userData){
				var hashedPassword = helpers.hash(password); 
				if(userData.hashedPassword === hashedPassword){
					var tokenId = helpers.generateRandomString(20); 
					var tokenObj = {
						id: tokenId,
						userEmail: userData.email,
						expiresAt : Date.now()+1000*60*60
					}
					_data.create('tokens', tokenId, tokenObj, (err)=>{
						if(!err){
							callback(200, tokenObj); 
						}else{	
							callback(500, {'Error': "Couldn't generate token"}); 
						}
					}); 
				}else{
					callback(403, {'Error': 'Email and password doesnot match our records'}); 
				}
			}else{
				callback(400, {'Error': 'Record not found'}); //unauthorized since the user is not in the lookup; 
			}
		}); 
	}else{
		callback(400, {'Error': 'Missing Required Fields'}); 
	}
};

//get a token
handler._tokens.get = (data, callback)=>{
	//get all user information via token; 
	var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false; 

	var email = helpers.verifyEmail(data.queryString.email); 

	if(email && token){	
		handler._tokens.verifyToken(token, email, (isTokenValid)=>{
			if(isTokenValid){	
				_data.read('tokens', token, (err, tokenData)=>{
			if(!err && tokenData){
				var tokenInfo = tokenData; 
				if(typeof(tokenData.userEmail) == 'string'){
					_data.read('users', tokenData.userEmail, (err, userData)=>{
						if(!err && userData){
							delete userData.hashedPassword; 
							var menuItems= []; 
							helpers.getAllMenuItems((err, menus)=>{
								if(!err && menus){
									menuItems = menus; 
								}
								callback(200, {'userData': userData, 'tokenInfo': tokenData, 'menuItems': menuItems});
							})
						}else{
							callback(400, {'Error': 'Couldnt retrieve user records'}); 
						}
					}); 
				}else{
					callback(500, {'Error': 'file Corrupted'}); 
				}
			}else{
				callback(500, {'Error': 'couldnt retrieve token information'}); 
			}
		}); 
			}else{
				callback(400, {'Error': 'Token invalid / expired'}); 
			}
		}); 
	}else{
		callback(400, {'Error': 'Missing required fields'}); 
	}
}; 

//remove a token; 
handler._tokens.delete = (data, callback)=>{
	if(typeof(data.queryString.email) == 'string'){
		var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false; 

		var email = helpers.verifyEmail(data.queryString.email); 

		if(email && token){	
		_data.read('tokens', token, (err, tokenData)=>{
			if(tokenData.userEmail === email){
				_data.delete('tokens', token, (err)=>{
					if(!err){
						callback(200, {'Message': 'Token destroyed successfully'}); 
					}else{
						callback(500, {'Error': 'Failed to destroy token'}); 
					}
				}); 
			}else{
				callback(403, {'Error': 'unauthorized request'}); 
			}
			}); 
		}else{
		callback(400, {'Error': 'Missing required fields'}); 
	}

	}else{
		callback(400, {'Error': 'Missing fields'}); 
	}

};

//extend a token; 
handler._tokens.put =(data, callback)=>{
	//get all user information via token; 
	var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false; 

	var email = helpers.verifyEmail(data.queryString.email); 

	if(email && token){	
		_data.read('tokens', token, (err, tokenData)=>{
			if(tokenData.userEmail === email){
				tokenData.expiresAt = Date.now()+1000*60*60; 
				_data.update('tokens', token, tokenData, (err)=>{
					if(!err){
						callback(200, {'Message': 'Token extended for 1 hr'}); 
					}else{
						callback(500, {'Error': 'Failed to extend token'}); 
					}
				}); 
			}else{
				callback(403, {'Error': 'unauthorized request'}); 
			}
		}); 
	}else{
		callback(400, {'Error': 'Missing required fields'}); 
	}
}

//verifyToken
handler._tokens.verifyToken = (id, email, callback)=>{
	_data.read('tokens', id, (err, tokenData)=>{
		if(!err && tokenData){
			if(tokenData['userEmail'] == email){
				//isExpired 
				if(tokenData['expiresAt'] > Date.now()){
					//there is a chance where token will be valid and active but user records is not so handle that case;
					_data.read('users', email, (err, userData)=>{
						if(!err && userData){
							if(userData['email'] == tokenData['userEmail']){
								callback(true); 
							}else{
								callback(false);  
							}
						}else{
							callback(false); 
						}
					}); 
				}else{
					_data.delete('tokens', id, (err)=>{
						callback(false); 
					});
				}
			}else{	
				callback(false); 
			}
		}else{
			callback(false); 
		}
	}); 
}



/*********************************************************************************

			Order implementation and its methods

************************************************************************************/

//orders 
//allowed methods post
handler.orders = (data, cb)=>{
	var allowedMethods = ['post']; //only user can place an order, if he is logged in orders are retrieved and sent to him, but he can't use  put or delete once the order is placed successfully as it is the requirement
	if(allowedMethods.indexOf(data.method.toLowerCase()) >-1){
		handler._orders[data.method.toLowerCase()](data, cb); 
	}else{
		cb(405); 
	}
}

//private methods; 
handler._orders = {}; 

//place an order
//mandatory userdetails(token, email), cart Info;
handler._orders.post = (data, callback)=>{
	if(data.queryString.email){
		var email = helpers.verifyEmail(data.queryString.email);
		if(email){
			var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim(): false; 
			if(token){
				handler._tokens.verifyToken(token, email, (isTokenValid)=>{
					if(isTokenValid){
					//get cart info 
					//sanity check
					var orders = typeof(data.payload.cartInfo) == 'object' && data.payload.cartInfo instanceof Array && data.payload.cartInfo.length > 0 ? data.payload.cartInfo : false;
					if(orders){
						handler._orders.processOrders(orders, (orderInfo)=>{
							if(typeof(orderInfo) == 'object' && orderInfo.items instanceof Array && orderInfo){
								if(typeof(orderInfo.totalCost) == 'number' && orderInfo.totalCost > 0 ){
									//make payment
										helpers.makePayment(orderInfo.totalCost,email, (err, paymentData)=>{
											if(!err && paymentData){
												//create new entry in order and update user table and generate confirmation email; 
												//create order entry
												var orderObj = {
													'id' : helpers.generateRandomString(20),
													'userEmail': email,
													'items' : orderInfo.items,
													'amount' : orderInfo.totalCost,
													'paymentId': paymentData.id,
													'paymentStatus': paymentData.status,
													'orderDate': paymentData.created*1000
												}
												_data.create('orders', orderObj.id, orderObj, (err)=>{
													if(!err){
														//update user table
														//check whether order array in user is already populated, if not create a new one and populate it, else push to the order array; 
														_data.read('users', email, (err, userData)=>{
															if(!err && userData){
																if(typeof(userData.orders) =='object' && userData.orders instanceof Array){
																	userData.orders.push(orderObj.id);
																	_data.update('users', email, userData, (err)=>{
																		if(!err){
																			//trigger email 
																			var paymentDate = new Date(orderObj.orderDate);
																			var subject = 'Order generated successfully and payment completed on '+paymentDate;
																			var message = `Order Details\n orderId: ${orderObj.id},\n paymentId: ${paymentData.id},\n amount: ${paymentData.amount},\n orderDate: ${paymentData.orderDate}`; 
																			helpers.sendEmail(email, subject, message, (err, res)=>{
																				if(!err && res){
																					//dump all payment data to payment logs;
																					var logObj = {
																						'orderId': orderObj.id,
																						'paymentData': paymentData
																					}
																					var dt = new Date(Date.now()); 
																					var logString = JSON.stringify(logObj); 
																					var logFileName = dt.getDate()+'-'+dt.getMonth()+'-'+dt.getFullYear(); 
																					_logs.append(logFileName, logString, (err)=>{
																						if(!err){
																							callback(200, {'Message': 'Order created, and all tables are updated and email triggered successfully and payment details are saved successfully'});
																						}else{
																							callback(201, {'Message': 'Order created, and all tables are updated and email triggered successfully but payment details are not saved'});
																						}
																					}); 
																					 
																				}else{
																					callback(500, {'Error': 'Payment successful and order table and user details are updated but email could not be triggered'}); 
																				}
																			}); 
																		}else{
																			callback(500, {'Error': 'Payment successful, but couldnt update order table and trigger email'}); 
																		}
																	}); 
																}else{
																	var orders = [];
																	orders.push(orderObj.id); 
																	userData.orders = orders; 
																	//update user table
																	_data.update('users', email, userData, (err)=>{
																		if(!err){
																			//trigger email 
																			var paymentDate = new Date(orderObj.orderDate);
																			var subject = 'Order generated successfully and payment completed on '+paymentDate;
																			var message = `Order Details\n orderId: ${orderObj.id}, paymentId: ${paymentData.id}`; 
																			helpers.sendEmail(email, subject, message, (err, res)=>{
																				if(!err && res){
																					//dump all payment data to payment logs;
																					var logObj = {
																						'orderId': orderObj.id,
																						'paymentData': paymentData
																					}
																					var dt = new Date(Date.now()); 
																					var logString = JSON.stringify(logObj); 
																					var logFileName = dt.getDate()+'-'+dt.getMonth()+'-'+dt.getFullYear(); 
																					_logs.append(logFileName, logString, (err)=>{
																						if(!err){
																							callback(200, {'Message': 'Order created, and all tables are updated and email triggered successfully and payment details are saved successfully'});
																						}else{
																							callback(201, {'Message': 'Order created, and all tables are updated and email triggered successfully but payment details are not saved'});
																						}
																					}); 
																				}else{
																					callback(500, {'Error': 'Payment successful and order table and user details are updated but email could not be triggered'}); 
																				}
																			});  
																		}else{
																			callback(500, {'Error': 'Payment successful, but couldnt update order table and trigger email'}); 
																		}
																	}); 
																}
															}else{
																callback(500, {'Error': 'Payment successful, but couldnt update order table and trigger email'}); 
															}
														}); 
													}else{
														callback(500, {'Error': 'Payment successful, but couldnt update order table and trigger email'}); 
													}
												});
											}else{
												callback(400, {'Error': 'Error in payment'}); 
											}
										}); 
									
								}else{
									callback(400, {'Error': 'Minimum amount for order not reached'}); 
								}
							}else{
								callback(400, {'Error': 'some items are not in the menu are in the cart'}); 
							}
						}); 
				
						
					} else{
						callback(400, {'Error': 'Order table is empty'}); 
					}

					}else{
						callback(403, {'Error': 'Invalid /expired token / unauthorized request'}); 
					}
				}); 
			}else{
				callback(400, {'Error': 'Invalid token'}); 
			}
		}else{
			callback(400, {'Error': 'Missing required fields'}); 
		}
	}else{
		callback(400, {'Error': 'Missing required fields'});
	}
	

};

//get all items and total cost from menu table; 
handler._orders.processOrders = (orders, callback)=>{
		var items = []; 
		var totalCost = 0;
		var menus = []; 
		var orderDetails = {}; 
		helpers.getAllMenuItems((err, menus)=>{
			menus = menus; 
			if(menus.length > 0){
				var i = 0; 
				orders.forEach((order)=>{
					//ignore if itemqty is less than 0 or decimal
					if(order.itemQty > 0 && Number.isInteger(order.itemQty)){
						//look up for the item in the menu; 
						var productDetails = {}; 
						menus.forEach((menu)=>{
							if(menu.id == order.itemId){
								productDetails = menu; 
								return;
							}
						}); 
					if(typeof(productDetails)=='object' && productDetails !== {}){
						var item = {
							id: productDetails.id,
							qty: order.itemQty
						}

						items.push(item); 
						totalCost += order.itemQty*productDetails.productPrice;
						i+=1;
					
					}
					if(i  == orders.length){
						//final orderdetails with total items and total cost if user adds any product not in the menu it will be discarded and not counted;
						orderDetails = {
							'items': items,
							'totalCost': totalCost
						}
						callback(orderDetails); 
					}
					}else{
						i += 1; 
					}

				}); 
			}
		}); 
		
} 




//a test ping to check whether the init is configured properly;
handler.ping = (data, callback)=>{
	callback(200, {'Content': 'keep alive'}); 
}

handler.notFound = (data, callback)=>{
	callback(404, {'Message': 'Page notFound'}); 
}

module.exports = handler; 