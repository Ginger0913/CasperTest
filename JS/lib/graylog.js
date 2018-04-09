var querystring = require('qs');
var https = require('https');

var sendResponse = function (msg){
	try{
		// Build the post string from an object
		var post_data = querystring.stringify({
			"api_key": "[API KEY]",
			"record": {
				"message":"Error Has Occured In A Casper Service!",
				"context":{
					"body": msg
				}
			}
		});
		var post_options = {
			host: '[THIS IS A CUSTOM ENDPOINT AS GRAYLOG WAS NOT ALLOWED ON THE INSTANCES THIS WAS RUNNING ON]',
			port: '443',
			path: '/api/v1/logforward',
			method: 'POST',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': Buffer.byteLength(post_data)
			}
		};
		// Set up the request
		var post_req = https.request(post_options, function(res) {
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
			  console.log('Response: ' + chunk);
		  });
		});

		// post the data
		post_req.write(post_data);
		post_req.end();
		return JSON.stringify(post_data);
	} catch(err){
		console.log(err);
	}
};

module.exports = {
	fatal: function(msg){
		return sendResponse('[FATAL] ' + msg);
	},
	error: function(msg){
		return sendResponse('[ERROR] ' + msg);
	}
};
