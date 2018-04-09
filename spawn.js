const { exec } = require('child_process');
var fs = require('fs');
var spawn = require('child_process').spawn;
//eval(fs.readFileSync(__dirname + '/conf/dev.js')+'');
try{
	var request = require('request');
	var graylog = require(__dirname + '/JS/lib/graylog');
} catch(e) {
	console.log(e);
}
var bin = "bin\\casperjs";
var casperInstances = 1;

function IsJsonString(str) {
    try {
		var o = JSON.parse(str);
		return (o && typeof o === "object" && o['error'])
    } catch (e) {
		return false;
	}
}

function handleError(errMsg){
	graylog.error(errMsg);
}

for(var i=1; i<=casperInstances; i++){
  var cspr = spawn(bin, process.argv.slice(2));
  cspr.stdout.setEncoding('utf8');
  cspr.stdout.on('data', function (data) {
      var buff = new Buffer(data);
      var response = buff.toString('utf8');
	  if(IsJsonString(response)){
		  graylog.error(response);
	  }
	  console.log(response);
  });
  cspr.stderr.on('data', function (data) {
      data += '';
      graylog.error(data.replace("\n", "\nstderr: "));
  });
  cspr.on('exit', function (code, signal) {
      console.log('Child process exited with code ' + code + ' with string: ' +  signal);
  });
}
