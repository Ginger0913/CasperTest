/* Create all phantom objects */
var page = require('webpage').create(),
    system = require('system'),
    fs = require('fs');
if (typeof basePath === 'undefined') {
    var basePath = fs.absolute('./'),
	libraryPath = basePath + '/JS/lib/';
}

// pull in lib
var colorizer = require('colorizer').create('Colorizer');
eval(fs.read(libraryPath + 'config.js'));

var cConfig = casperConfig(basePath);
if (typeof cConfig === 'undefined') throw 'Exception: Could not get casper config';
var casper = require('casper').create(cConfig);
var utils = require('utils');
var f = utils.format;

/* Set timeout and report error on timeout */
casper.options.waitTimeout = 60000;
casper.options.stepTimeout = 60000;

eval(fs.read(libraryPath + 'lib.js'));
eval(fs.read(libraryPath + 'helper.js'));
eval(fs.read(libraryPath + 'creds.js'));

var writeToConsole = writeOutCurried(true);
var wo = function(msg) {
	try{
    casper.echo(logger.info(msg));
	} catch(e){
		casper.echo(e);
	}
}

wo('--- Starting Emulator ---');

var x = require('casper').selectXPath;

eval(fs.read(basePath + '/JS/' + run_script));

try {
    /* Run and exit when done */
    casper.run(function() {
        this.exit();
    });

} catch (e) {
	casper.echo(e);
    exit(e);
}
