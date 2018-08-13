/*
*lib for log handling compressing and decompressing. Mainly for handling payment transaction logs
*
*/

//dependencies
var fs = require('fs'); 
var path = require('path'); 
var zlib = require('zlib'); 


//container for log module
var logs = {}; 

logs.baseDir = path.join(__dirname+'/../.logs/'); 

//append data to file; 
logs.append = (fileName, logstring, callback)=>{
	//open file for appending
	fs.open(logs.baseDir+fileName+'.log', 'a', (err, fileDescriptor)=>{
		if(!err && fileDescriptor){
			fs.appendFile(fileDescriptor, logstring +'\n', (err)=>{
				if(!err){
					callback(false)
				}else{
					callback('Could not append data to file'); 
				}
			}); 
		}else{
			callback('Could not append file for appending'); 
		}
	}); 
}

//list all the logs; 
logs.list = (includeCompressedLogs, callback)=>{
	fs.readdir(logs.baseDir, (err, fileNames)=>{
		if(!err && fileNames){
			var fileNamesWithoutExtension = []; 
			fileNames.forEach((fileName)=>{
				if(fileName.indexOf('.log') > -1){
					fileNamesWithoutExtension.push(fileName.replace('.log', '')); 
				}
				//add .gz extension if include flag is turned on
				if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs){
					fileNamesWithoutExtension.push(fileName.replace('.gz.b64', '')); 
				}
			});
			callback(false, fileNamesWithoutExtension);  
		}else{
			callback('Error listing all logs'); 
		}
	}); 
}

//compress all the contents as .gz.b64 in the same dir
logs.compress = (logId, newFileId, callback)=>{
	var logFileName = logId+'.log'; 
	var newFileName = newFileId+'.gz.b64'; 

	//read the source file
	fs.readFile(logs.baseDir+logFileName, 'utf8', (err, fileString)=>{
		if(!err && fileString){
			//compress the data using gzip; 
			zlib.gzip(fileString, (err, buffer)=>{
				if(!err && buffer){
					//save the data in destination file; 
					fs.open(logs.baseDir+newFileName,'wx', (err, fileDescriptor)=>{
						if(!err && fileDescriptor){
							fs.writeFile(fileDescriptor, buffer.toString('base64'), (err)=>{
								if(!err){
									callback(false); 
								}else{
									callback(err); 
								}
							}); 
						}else{
							callback(err); 
						}
					}); 
				}else{
					callback(err);
				}
			}); 
		}else{
			callback(err); 
		}
	}); 
}; 

//decompress log files from gzip b64 to string to be used for later use; 
logs.decompress = (fileId, callback)=>{
	var fileName = fileId+'.gzip.b64'; 
	fs.readFile(logs.baseDir+fileName, (err, fileString)=>{
		if(!err && fileString){
			//decompress the data; 
			var inputBuffer = Buffer.from(fileString, 'base64'); 
			zlib.unzip(inputBuffer, (err, outputBuffer)=>{
				if(!err && outputBuffer){
					var str = outputBuffer.toString(); 
					callback(false, str); 
				}else{
					callback(err, ''); 
				}
			}); 
		}else{
			callback(err, ''); 
		}
	}); 
}; 

//truncate a log file; 
logs.truncate = (logId, callback)=>{
	fs.truncate(logs.baseDir+logId+'.log', 0, (err)=>{
		if(!err){
			callback(false); 
		}else{
			callback(err); 
		}
	}); 
}; 



//export log
module.exports = logs