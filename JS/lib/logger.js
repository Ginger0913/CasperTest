/**
 * Node logging
 *
 * Usage:
 * var logger = require('my_location/logger');
 * logger.warning('writing out to log');
 *
 * Outputs:
 * [Aug-11-2017 10:50:57] [WARNING] writing out to log
 */

	
/**
 * Get log date format
 * @returns {string}
 * @private
 */
var _getDateTime = function (withTime) {
	withTime = typeof withTime === 'undefined' ? true : withTime;
	var n = new Date();
	var monthNames = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];
	var dt = (monthNames[n.getMonth()].substring(0, 3))
		+ "-" + n.getDate()
		+ "-" + n.getFullYear();
	return withTime ? dt + ' ' + n.getHours() + ':' + n.getMinutes() : dt;
};

var getDate = function() {
	return _getDateTime(false);
};

/**
 * Write simple log
 * @param msg
 * @returns function
 */
var logging = function (msg){
	var file_loc = (fs.absolute('./') + '/logs/emulator-' + getDate() + '.log');
	var datetime = '[' + _getDateTime() + '] ';
	msg = datetime + msg;
	if (fs.appendFile) {
		// CasperJS doesn't have appendFile
		fs.appendFile(file_loc, msg + '\r\n', function (err) {
			throw err;
		});
		return msg;
	} else {
		fs.write(file_loc, msg + '\r\n', 'a');
		return msg;
	}
};

module.exports = {
	error: function(msg){
		return logging('[ERROR] ' + msg);
	},
	warning: function(msg){
		return logging('[WARNING] ' + msg);
	},
	fatal: function(msg){
		return logging('[FATAL] ' + msg);
	},
	debug: function(msg){
		return logging('[DEBUG] ' + msg);
	},
	info: function(msg){
		return logging('[INFO] ' + msg);
	}
};