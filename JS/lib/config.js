var casperConfig = function (base_path) {
    return {
		logLevel:'debug',
		verbose:false,
		viewportSize: {
			width: 1280,
			height: 1555
		},
		clientScripts: [
			basePath+'/jquery.js',
			basePath+'/ocrad.js'
		],
		pageSettings: {
			localToRemoteUrlAccessEnabled: true,
			webSecurityEnabled: false,
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
		},
		onWaitTimeout: function() {
			casper.capture('wait_time_out/error.png');
			failed(900, "Wait timeout on page: " + casper.getCurrentUrl());
		},
		onStepTimeout: function() {
			casper.capture('step_time_out/error.png');
			failed(900, "Step timeout on page: " + casper.getCurrentUrl());
		},
		onConsoleMessage: function(msg, lineNum, sourceId){
			casper.echo('CONSOLE: '+msg+' (from line #'+lineNum+' in "'+sourceId+'"');
		}
    }
};
