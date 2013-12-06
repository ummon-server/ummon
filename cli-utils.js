var util = require('util');
var colors = require('colors');
var _ = require('underscore');
var rc = require('rc');
var moment = require('moment');

var l = console.log;


/**
 * Format an ummon task
 *
 * @param  {Task} task
 */
exports.formatTask = function(task) {
  var heading = task.id.white;
  if (task.enabled === false) { heading = '(disabled) '.red + heading}

  var command = task.command;
  command += (task.cwd)?' (in '+task.cwd +')':'';
  l(heading + ': $ '.grey + command);

  if (task.trigger) {
    if (task.trigger.afterFailed) {
      l('Trigger after Failed: '+task.trigger.afterFailed);
    }
    else {
      var trigger = task.trigger.time || task.trigger.after || task.trigger;
      l('Trigger: '+ trigger)
    }
  }

  if (task.lastSuccessfulRun) {
    l('Last successful run: ' + moment(task.lastSuccessfulRun).calendar())
  }

  if (task.recentExitCodes.length) {
    // Group by exit codes, [0,0,1,1] becomes {'0':[0,0], '1':[1,1]}
    var codes = _.groupBy(task.recentExitCodes);
    // Count the zeros!
    var countSuccess = (codes['0']) ? codes['0'].length : 0;
    // No zeros / total exit codes * 100 === pecentage
    var percentage = (countSuccess / task.recentExitCodes.length * 100);

    var label = "Success rate (last 10): "

    // This isn't pretty but it works for now
    if (percentage < 20) {
      l(label + percentage.toString().red + '%'.red);
    } else if (percentage == 100) {
      l(label + percentage.toString().green + '%'.green);
    } else {
      l(label + percentage.toString().yellow + '%'.yellow);
    }
  }

  l('');
}


exports.formatJson = function(data) {
  console.log(util.inspect(data, { showHidden: true, depth: null }));
}


/**
 * A simple helper to print key:value pairs
 */
exports.formatKeyVal = function(key, val) {
  l(key + ': '+val);
}


exports.errorIfBadTaskID = function(task) {
  if (task.indexOf('.') === -1) {
    ifError(new Error('('+task+') is not a correct task id. Please use format: <collection>.<name>'));
  }
}

/**
 * Helper to print errors if there is an error
 *
 * @param  {Error} err [description]
 * @return {[type]}     [description]
 */
exports.ifError = ifError = function(err) {
  if (err) {
    l('')
    util.error('** ERROR **'.red);
    if (err.statusCode) { util.error(' ('+err.statusCode+')') }
    l('');
    if (err.message) {
      util.error(err.message.red);
    } else {
      util.error(err.red);
    }
    process.exit(1);
  }
}


/**
 * Helper to add all of the default options neccesary for each ummon cli
 *
 * @param {Object} program The commander object
 */
var addGlobalOptions = exports.addGlobalOptions = function(program) {
  // Global Options
  program
    .option('--env <env>', 'The ummon environment to connect to (Automatically loaded from ~/.ummonrc if present)')
    .option('-h, --url <url>', 'The url where the ummon server is running. (Automatically loaded from ~/.ummonrc if present)', 'http://localhost:8888')
    .option('-u, --username <username>', 'Your username (Automatically loaded from ~/.ummonrc if present)')
    .option('-p, --password <password>', 'Your password (Automatically loaded from ~/.ummonrc if present)')
    .option('-r, --retry <count>', 'The amount of times to retry a failed connection', 3)
    .option('-t, --timeout <seconds>', 'The amount of time to to wait between retries', 1);

  return program;
}


/**
 * Load configuration options from users .ummonrc file
 *
 * @param {Object} program The commander object
 * @return {Object}         ummon configuration object
 */
var loadLocalConfig = exports.loadLocalConfig = function(program) {
  var config = require('rc')('ummon', {}, {});

  if (!program.env) {
    program.env = config.defaultEnv;
  }
  // Bring env settings into the root
  return _.extend(program, config[program.env])
}


/**
 * Helper to quickly setup each task
 *
 * @param {Object} program The commander object
 * @param  {Object} argv    Process argv
 * @return {Object}         Fully modified commander object
 */
exports.parse = function(program, argv) {
  program = addGlobalOptions(program);

  program.parse(argv);

  program = loadLocalConfig(program);

  return program
}
