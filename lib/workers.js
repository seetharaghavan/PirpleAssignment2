/*
*background workers to compress logs
*/

//dependencies
var path = require('path'); 
var _logs = require('./logs'); 
var util = require('util'); 
var debug = util.debuglog('workers'); 
var config = require('./config'); 

//container for workers module

var workers = {}; 


//compress log files
workers.rotateLogs = ()=>{
	//list all non compressed files in log folder; 
	_logs.list(false,(err, logs)=>{
		if(!err && logs && logs.length >0){
			logs.forEach((log)=>{
				var logId = log.replace('.log', '');
				var newFileId = logId+'-'+Date.now(); //capture the timestamp of archiving;
				_logs.compress(logId, newFileId, (err)=>{
					if(!err){
						//truncate the log file; 
						_logs.truncate(logId, (err)=>{
							if(!err){
								debug('succeded in truncating the log file'); 
							}else{
								debug(err); 
							}
						}); 
					}else{	
						debug('Error in compressing the file'); 
					}
				}); 
			}); 
		}else{
			debug('Couldn\'t find any logs'); 
		}
	}); 
}

//loop it through interval set at config; 
workers.loop = ()=>{
	setInterval(()=>{
		workers.rotateLogs(); 
	}, 1000*60*60*config.workerInterval); 
}

//initialize workers 
workers.init = ()=>{
	//console log that workers are started running; 
	console.log('\x1b[33m%s\x1b[0m', 'Background workers are started running'); 

	//start the loop;
	workers.loop(); 
}

//export worker
module.exports = workers; 