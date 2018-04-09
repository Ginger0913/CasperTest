/**
 * @warning Pull in after casper instantiation
 */
/**
 * Function to check for required parameters
 */
function checkRequired(param) {
    if (!casper.cli.has(param)) {
        failed("Missing required parameter: " + param, "bp");
    } else {
		var new_param = casper.cli.raw.get(param).replace(/'/gi, "");
		return new_param;
	}
}

/**
 * Revised checkStep() function for realizing label() and goto()
 * Every revised points are commented.
 *
 * @param self A self reference
 * @param onComplete An options callback to apply on completion
 */
casper.checkStep = function checkStep(self, onComplete) {
    if (self.pendingWait || self.loadInProgress) {
        return;
    }
    self.current = self.step;                 // Added:  New Property.  self.current is current execution step pointer
    var step = self.steps[self.step++];
    if (utils.isFunction(step)) {
        self.runStep(step);
        step.executed = true;                 // Added:  This navigation step is executed already or not.
    } else {
        self.result.time = new Date().getTime() - self.startTime;
        self.log(f("Done %s steps in %dms", self.steps.length, self.result.time), "info");
        clearInterval(self.checker);
        self.emit('run.complete');
        if (utils.isFunction(onComplete)) {
            try {
                onComplete.call(self, self);
            } catch (err) {
                self.log("Could not complete final step: " + err, "error");
            }
        } else {
            // default behavior is to exit
            self.exit();
        }
    }
};

/**
 * Revised then() function for realizing label() and goto()
 * Every revised points are commented.
 *
 * @param step function  step  A function to be called as a step
 * @return Casper
 */
casper.then = function then(step) {
    if (!this.started) {
        failed("Casper not started; please use Casper#start", "ce");
    }
    if (!utils.isFunction(step)) {
        failed("You can only define a step as a function", "ce");
    }
    // check if casper is running
    if (this.checker === null) {
        // append step to the end of the queue
        step.level = 0;
        this.steps.push(step);
        step.executed = false;                 // Added:  New Property. This navigation step is executed already or not.
        this.emit('step.added', step);         // Moved:  from bottom
    } else {

        if (!this.steps[this.current].executed) {  // Added:  Add step to this.steps only in the case of not being executed yet.
            // insert substep a level deeper
            try {
//          step.level = this.steps[this.step - 1].level + 1;   <=== Original
                step.level = this.steps[this.current].level + 1;   // Changed:  (this.step-1) is not always current navigation step
            } catch (e) {
                step.level = 0;
            }
            var insertIndex = this.step;
            while (this.steps[insertIndex] && step.level === this.steps[insertIndex].level) {
                insertIndex++;
            }
            this.steps.splice(insertIndex, 0, step);
            step.executed = false;                    // Added:  New Property. This navigation step is executed already or not.
            this.emit('step.added', step);            // Moved:  from bottom
        }                                           // Added:  End of if() that is added.

    }
//    this.emit('step.added', step);   // Move above. Because then() is not always adding step. only first execution time.
    return this;
};

/**
 * Adds a new navigation step by 'then()'  with naming label
 *
 * @param  labelname  String        Label name for naming execution step
 */
casper.label = function label(labelname) {
    var step = new Function('"empty function for label: ' + labelname + ' "');   // make empty step
    step.label = labelname;                                 // Adds new property 'label' to the step for label naming
    this.then(step);                                        // Adds new step by then()
};

/**
 * Goto labeled navigation step
 * @param labelname String Label name for jumping navigation step
 */
casper.goto = function goto(labelname) {
    for (var i = 0; i < this.steps.length; i++) {         // Search for label in steps array
        if (this.steps[i].label === labelname) {      // found?
            this.step = i;                              // new step pointer is set
        }
    }
};

/**
 * Dump Navigation Steps for debugging
 * When you call this function, you can get current all information about CasperJS Navigation Steps
 * This is compatible with label() and goto() functions already.
 *
 * @param showSource  Boolen       showing the source code in the navigation step?
 *
 * All step No. display is (steps array index + 1),  in order to accord with logging [info] messages.
 *
 */
casper.dumpSteps = function dumpSteps(showSource) {
    this.echo("=========================== Dump Navigation Steps ==============================", "RED_BAR");
    if (this.current) {
        this.echo("Current step No. = " + (this.current + 1), "INFO");
    }
    this.echo("Next    step No. = " + (this.step + 1), "INFO");
    this.echo("steps.length = " + this.steps.length, "INFO");
    this.echo("================================================================================", "WARNING");

    for (var i = 0; i < this.steps.length; i++) {
        var step = this.steps[i];
        var msg = "Step: " + (i + 1) + "/" + this.steps.length + "     level: " + step.level;
        if (step.executed) {
            msg = msg + "     executed: " + step.executed;
        }
        var color = "PARAMETER";
        if (step.label) {
            color = "INFO";
            msg = msg + "     label: " + step.label;
        }

        if (i === this.current) {
            this.echo(msg + "     <====== Current Navigation Step.", "COMMENT");
        } else {
            this.echo(msg, color);
        }
        if (showSource) {
            this.echo("--------------------------------------------------------------------------------");
            this.echo(this.steps[i]);
            this.echo("================================================================================", "WARNING");
        }
    }
};

/**
 * Wait for element to contain text
 * When you call this function, you wait for any given element to contain a certain text
 *
 */
casper.waitForSelectorText = function (selector, text) {
    this.waitForSelector(selector, function _then() {
        var content = this.fetchText(selector);
        if (utils.isRegExp(text)) {
            return text.test(content);
        }
        return content.indexOf(text) !== -1;
    });
    return this;
};
