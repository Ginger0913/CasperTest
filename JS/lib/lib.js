try{
	var logger = require(fs.absolute('./JS/lib/logger'));
} catch(e) {
	casper.echo(e);
}

/**
 * Dumps the image in Debugging/label.png
 * @param label
 */
function takeDebugScreenshot(label) {
    var dest = "DebuggingScreenshots/" + label + ".png";
    var out = "Saving screenshot: " + dest;
    if (typeof wo !== 'undefined') {
        wo(out); // expecting curried version
    } else {
        writeOut(out);
    }
    casper.capture(dest);
}

/**
 *
 * @param firstAmount
 * @param secondAmount
 * @param padding
 * @returns {boolean}
 */
function doesAmountMatch(firstAmount, secondAmount, padding) {
    padding = typeof padding === 'undefined' ? 1 : padding;
    return Math.abs(parseFloat(firstAmount) - parseFloat(secondAmount)) <= padding;
}

/**
 * Compares Api date and Order form date for a match
 * using padding
 * @param firstDate
 * @param secondDate
 * @param datePadding
 * @returns {boolean}
 */
function doesDateMatch(firstDate, secondDate, datePadding) {
    datePadding = typeof datePadding === 'undefined' ? 1 : datePadding;
    var pad = daysToMilliseconds(parseInt(datePadding));
    var diff = Math.abs(firstDate.getTime() - secondDate.getTime());
    return diff <= pad;
}

/**
 * returns day in mm/dd/yy(yy) format
 * @param date
 * @returns string
 */
function extractDay(date) {
    return date.split('/')[1];
}

/**
 * return month in mm/dd/yy(yy)
 * @param date
 * @returns string
 */
function extractMonth(date) {
    return date.split('/')[0]
}

/**
 * returns day in mm/dd/yy(yy) format
 * @param date
 * @returns {*}
 */
function extractYear(date) {
    return date.split('/')[2]
}

/**
 * You cannot be 100% sure that the browser will
 *  interpret Date.parse()/new Date() exactly your desired format.
 * @param date_str
 * @returns Date()
 */
function getDate(date_str) {
    var parts = date_str.match(/(\d+)/g);
    return new Date(parts[0], parts[1] - 1, parts[2]); // months are 0-based
}

/**
 * @param xpath
 * @param value
 */
function setXPathValue(xpath, value) {
    var fromDate = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    fromDate.value = value;
}

/**
 * @param dateObj Date()
 * @returns Date()
 */
function addDay(dateObj) {
    dateObj.setDate(dateObj.getDate() + 1);
    return dateObj
}

/**
 * @param dateObj Date()
 * @returns Date()
 */
function subtractDay(dateObj) {
    dateObj.setDate(dateObj.getDate() - 1);
    return dateObj
}

/**
 * Date() to mm/dd/yyyy
 * @param dateObj
 * @returns {string}
 */
function formatDate(dateObj) {
    return ("0" + (dateObj.getMonth() + 1)).slice(-2) + '/'
        + ("0" + dateObj.getDate()).slice(-2) + '/'
        + dateObj.getFullYear().toString().slice(-2)
}

/**
 * Milliseconds to hours
 * @param milliseconds
 * @returns {Number}
 */
function millisecondsToHours(milliseconds) {
    return parseInt(milliseconds / 3600000)
}

function hoursToMilliseconds(hours) {
    return parseInt(hours) * 3600000
}

function daysToMilliseconds(days) {
    return hoursToMilliseconds(parseInt(days) * 24)
}

function millisecondsToDays(milliseconds) {
    return Math.abs(millisecondsToHours(parseInt(milliseconds)) / 24)
}

/**
 * @param a
 * @param b
 * @returns {number}
 */
function subtractUSDFloats(a, b) {
    var intA = parseFloat(a) * 100;
    var intB = parseFloat(b) * 100;
    return Math.abs(intA - intB) / 100;
}

/**
 * Stitch functions together
 * ie: var newFunc = compose(thirdApplied, secondApplied, firstApplied)
 * result = newFunc(param)
 * @param secondFunc
 * @param firstFunc
 * @returns {Function}
 */
function compose(secondFunc, firstFunc) {
    return function (x) {
        return secondFunc(firstFunc(x));
    };
}

/**
 * Stitch function calls together (reverse order than compose)
 * ie: var newFunc = sequence(firstToapply, Second, third, ...);
 * @returns {Function}
 */
function sequence() {
    var fns = arguments;

    return function (result) {
        for (var i = 0; i < fns.length; i++) {
            result = fns[i].call(this, result);
        }
        return result;
    };
}

/**
 * @param msg
 * @param enableOutput
 * @returns {boolean}
 */
function writeOut(msg, enableOutput) {
    msg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    enableOutput = typeof enableOutput === 'undefined' ? false : enableOutput;
    if (enableOutput) casper.echo(msg);
    return true;
}

/**
 * usage:
 * var wo = writeOutCurried(true);
 * wo('send message to log');
 *
 * Curry writeOut to toggle console output
 * @param debugging
 * @returns {Function}
 */
function writeOutCurried(debugging) {
    return function (msg) {
        writeOut(msg, debugging)
    };
}

/**
 * Extract array of row objects from table
 * @param xpath
 * @param columnCount
 * @returns {Array}
 */
function extractTableData(xpath, columnCount) {
    return casper.evaluate(function (xpath, columnCount) {
        var ns = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var data = [];
        var order_row = {};
        for (var i = 0; i < ns.snapshotLength; i++) {
            var obj_index = i > columnCount - 1 ? i % columnCount : i;
            order_row[obj_index] = ns.snapshotItem(i).textContent;
            if (obj_index === columnCount - 1) {
                data.push(order_row);
                order_row = {};
            }
        }
        return data;
    }, xpath, columnCount);
}

/**
 *
 * @param columnCount
 * @returns {Function}
 */
function extractTableDataCurried(columnCount) {
    return function (xpath) {
        return extractTableData(xpath, columnCount);
    }
}

/**
 * JSON parsed api result
 * @param result
 */
function validateApiCall(result) {
    if (!result) throw "No result";
    if (!result['success']) throw "No success param";
    if (result['data'] === false) throw "No data";
    if (result['success'] && !result['data']) throw "Success with no data";
    if (!result['data']['cb_id']) throw "No cb-id";
}

/**
 * usage: casperPostCurried(api)({})
 * @param api
 * @returns {Function}
 */
function casperPostCurried(api, apiKey) {
    return function (postData) {
        postData.api_key = apiKey;
        return casperPost(api, postData);
    }
}

/**
 *
 * @param tag
 * @param x
 * @returns {Function}
 */
function trace(tag, x) {
    console.log(tag + ': ' + x);
    return function (x) {
        return x
    }
}

/**
 * Ajax call
 * @requires jQuery pulled in casper config
 * @param url
 * @param postData
 */
function casperPost(url, postData) {
    return casper.evaluate(function (url, postData) {
        return $.ajax(url, {
            async: false,
            data: postData,
            method: 'POST'
        });
    }, url, postData);
}

/**
 * @returns {{success: number, msg: *, code: *, cb_id, value: string, method: *, api_key: *}}
 * @param post
 */
function getPostObj(post) {
    if (typeof post !== 'undefined') {
        if (typeof post.cb_id === 'undefined') throw 'cb_id required';
        if (typeof post.method === 'undefined') throw 'method required';
    } else {
        post = {}
    }

    post.id = post.id || null;
    post.method = post.method || null;
    post.value = post.value || {};
    post.success = post.success || 1;
    post.code = post.code || 200;
    post.msg = post.msg || '';

    return post
}

/**
 * Exit casper with message
 * @param msg
 */
function exit(msg) {
    casper.echo('Exiting: ' + msg);
    casper.then(function () {
        this.exit();
    })
}

/**
 * Write content to local file
 * @param fileName
 * @param content
 */
function writeFile(fileName, content) {
    if (typeof fs === 'undefined') throw 'fs needs to be required, cannot write file: ' + fileName;
    content = typeof content === 'object' ? JSON.stringify(content) : content;
    wo('Writing file: ' + fileName);
    fs.write(fileName, content, 'w');
}

function failed(code, msg){
    casper.capture(code+'.png');

    var post = {};
    post.success = 'false';
    post.msg = msg;
    post.code = code;
    post.id = $ID;

    post.method = '[function_being_called]';
    post.api_key = $APIKey;

    var results = casper.evaluate(function(post, API){
        return $.ajax(API, {
	    async: false,
	    data: post,
 	    method: 'POST'
        });
    }, {
        'post': post,
        'API': $API
    });


	var fs = require('fs');
	var myfile = "LogFile.txt";
	var myData = (JSON.stringify(post) + "\n AJAX Result: "+JSON.stringify(results.responseText));
	fs.write(myfile, myData, 'w');
	logger.error(JSON.stringify({'code': code, 'error': msg}))
    casper.echo(JSON.stringify({'code': code, 'error': msg}));
    casper.exit();
    casper.die("Done");
}

function noCB()
{
    var echo = {};
    echo.success = 'false';
    echo.msg = "No items to run";
    echo.code = "0";

    casper.echo(JSON.stringify(echo));
    casper.exit();
    casper.die("Done");
}
