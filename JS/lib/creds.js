
/* Save credentials to casper variable */
var current_process = casper.cli.raw.get('process');

var run_script = checkRequired('jsfile');