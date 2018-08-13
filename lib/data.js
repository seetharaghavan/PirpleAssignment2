/*
*Module for storing data in the server;
*
*/

//dependencies; 
var fs = require('fs'); 
var helpers = require('./helper'); 
var path = require('path'); 

//container module for data; 
var lib = {}; 


//set base dir to .data which is our database; 
lib.baseDir = path.join(__dirname, '/../.data/'); 

//methods and implementation; 
//write data to a file
lib.create = (dir, fileId, fileDetails, callback)=>{
	//open a file with file Id
	fs.open(lib.baseDir+dir+'/'+fileId+'.json','wx', (err, fileDescriptor)=>{
		if(!err && fileDescriptor){
			var stringData = JSON.stringify(fileDetails); 
			fs.writeFile(fileDescriptor, stringData, (err)=>{
				if(!err) {
					fs.close(fileDescriptor, (err)=>{
						if(!err){
							callback(false);
						}else{
							callback('Could not close the file'); 
						}
					}); 
				} 
				else{
					callback("Couldn't write to a new file"); 
				}
			}); 
		}else{
			callback("Couldn't create new file, it may already exist"); 
		}
	});
}

//read data from file; 
lib.read = (dir, fileId,callback)=>{
	fs.readFile(lib.baseDir+dir+'/'+fileId+'.json', (err, fileData)=>{
		if(!err && fileData){
			var parsedData = helpers.parseJsonToObject(fileData); 
			callback(err, parsedData); 
		}else{
			callback(err, fileData); 
		}
	}); 
};

//update the data; 
lib.update = (dir, fileId, fileDetails, callback)=>{
	fs.open(lib.baseDir+dir+'/'+fileId+'.json', 'r+', (err, fileDescriptor)=>{
		if(!err && fileDescriptor){
			var stringData = JSON.stringify(fileDetails); 
			fs.truncate(fileDescriptor, (err)=>{
				if(!err){
					fs.write(fileDescriptor, stringData, (err)=>{
						if(!err){
							fs.close(fileDescriptor, (err)=>{
								callback(false); 
							}); 
						}else{
							callback('Error in writting to the file'); 
						}
					}); 
				}else{
					callback('Error in truncating the file'); 
				}
			});
		}else{
			callback('Error in reading the file'); 
		}
	}); 
}; 

//delete the file; 
lib.delete = (dir,fileId, callback)=>{
	fs.unlink(lib.baseDir+dir+'/'+fileId+'.json', (err)=>{
		if(!err){
			callback(false); 
		}else{
			callback('Error in deleting the file'); 
		}
	}); 
}; 

//list all data; 
lib.list = (dirName, callback)=>{
	fs.readdir(lib.baseDir+dirName, (err, listData)=>{
		if(!err && listData){
			if(typeof(listData) == 'object' && listData instanceof Array && listData.length >0){
				var trimmedFileNames = []; 
				listData.forEach((list)=>{
					trimmedFileNames.push(list.replace('.json', '')); 
				}); 
				callback(false, trimmedFileNames); 
			}else{
				callback('Dir is corrupted'); 
			}
		}else{
			callback(err, data); 
		}
	}); 
}; 

module.exports = lib; 