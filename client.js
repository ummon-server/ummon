'use strict';


/*!
 * Module dependencies.
 */
var assert = require('assert');
var restify = require('restify');
var url = require('url');


module.exports = function(options){
  var apiUrls = {};
  apiUrls.ps = '/ps';
  apiUrls.config = '/config';
  apiUrls.status = '/status';
  apiUrls.log = '/log';
  apiUrls.tasks = '/tasks';
  apiUrls.createTask = apiUrls.tasks + '/new';
  apiUrls.collections = '/collections';

  var api = false;
  var client = {};


  /**
   * Setup the restify client
   *
   * @param  {object} options Restify client options like url, timeout and retries
   */
  client.configure = function(options){
    if (!options) { options = {}; }
    var config = {};

    // Cheap and dirty default values.
    config.version = '*';
    config.url = options.url || 'http://localhost:8888';
    if (options.retry) { config.retry = {"retries":options.retry}; }
    config.timeout = options.timeout || 1;

    api = restify.createJsonClient(config);

    if (options.username && options.password) {
      api.basicAuth(options.username, options.password);
    }
  };
  // Configure the restify client
  client.configure(options);


  /**
   * Authenticate your client
   *
   * If you pass username and password keys to the constructor
   * it will authenticate for you
   *
   * @see client.configure()
   * @param  {String} user
   * @param  {String} pass
   */
  client.basicAuth = function(user, pass){
    api.basicAuth(user, pass);
  };


  /**
   * Retreive the status of your ummon server
   *
   * Returns:
   *
   *      // TODO
   *
   * @param  {Function} callback(err, result)
   */
  client.getStatus = function(callback) {
    api.get(apiUrls.status, function(err, req, res, result) {
      callback(err, result);
    })
  };


  /**
   * Return ummon-servers configuration
   *
   * Returns:
   *
   *      // TODO
   *
   * @param  {Function} callback(err, result)
   */
  client.getConfig = function(callback) {
    api.get(apiUrls.config, function(err, req, res, result) {
      callback(err, result);
    })
  };


  /**
   * Set configuration options
   *
   * Example:
   *
   *      client.setConfig( {pause: true}, function(err, result){
   *        console.log('Ummon has been paused');
   *      });
   *
   *
   * @param {Object} options configuration options to set
   * @param  {Function} callback(err, result)
   */
  client.setConfig = function(options, callback) {
    var setConfigUrl = url.parse(apiUrls.config);
    setConfigUrl.query = options;
    setConfigUrl = url.format(setConfigUrl);
    api.put(setConfigUrl, function(err, req, res, result) {
      callback(err, result);
    })
  };


  /**
   * Return a portion of the server's log
   *
   * ## Example:
   *
   *      client.showLog({ lines: 500, filter: {collection: 'ummon'}}, function(err, result){
   *        console.log(result)
   *      })
   *
   * ## Options:
   *
   * * lines: The number of lines to retreive
   * * runsOnly: Return only a history of completed tasks, without task output
   * * filter: Object with key collection, task or run
   *
   * @param  {Object}   options  Options to control the filtering of the logs
   * @param  {Function} callback callback(err, result)
   */
  client.showLog = function(options, callback){
    if (!callback && 'function' === typeof options){
      callback = options;
    }

    var key = Object.keys(options.filter)[0];
    var val = options[key];

    var logUrl = (key) ? apiUrls.log+'/'+key+'/'+val : apiUrls.log;
    logUrl+="?lines="+options.lines;

    if (options.runsOnly) {
      logUrl+="&runsOnly=true";
    }

    if (options.follow) {
      logUrl+="&follow=true";
    }

    api.get(logUrl, function(err, req, res, result) {
      // res.on('data', function(chunk){
      //   console.log('DATA: '+ chunk)
      // })

      // res.on('data', function(chunk){
      //   console.log('DATA: '+ chunk)
      // })
      callback(err, res.body); // This is weird that result is empty and res.body isn't
    });
  };


  /**
   * Return the defautls for a particular collection
   *
   * @param  {String}   collection A collection name
   * @param  {Function} callback   callback(err, result)
   */
  client.getCollectionDefaults = function(collection, callback) {
    api.get(apiUrls.collections+'/'+collection+'/defaults', function(err, req, res, result) {
      callback(err, result);
    });
  };


  /**
   * Set the defaults for a particular collection
   *
   * @param  {String}   collection A collection name
   * @param  {Object} config The values to set as defaults, eg: cwd
   * @param  {Function} callback   callback(err, result)
   */
  client.setCollectionDefaults = function(collection, config, callback) {
    api.put(apiUrls.collections+'/'+collection+'/defaults', config, function(err, req, res, result) {
      callback(err, result);
    });
  };


  /**
   * Create a new collection. Also useful for renaming collections
   *
   * @param {String}   collection The new collection's name
   * @param {Object}   config     An object containing defaults, settings and tasks
   * @param {Function} callback   callback(err, result)
   */
  client.setTasks = function(collection, config, callback) {
    api.put(apiUrls.collections+'/'+collection, config, function(err, req, res, result) {
      callback(err, result);
    });
  };


  /**
   * Enable an individual task or a collection of tasks
   *
   * ## Examples:
   *
   *     // Enable a single task
   *     client.enableTasks({ task:'ummon.doAwesome' }, callback)
   *
   *     // Enable a collection
   *     client.enableTasks({ collection:'ummon' }, callback)
   *
   *
   * @param  {Object}   options  Object describing what to enable
   * @param  {Function} callback callback(err, result)
   */
  client.enableTasks = function(options, callback) {
    var enableTasksUrl;
    if (options.collection) {
      enableTasksUrl = apiUrls.collections+'/'+options.collection + '/enable'
    } else if (options.task) {
      enableTasksUrl = apiUrls.tasks+'/' + options.task + '/enable'
    } else {
      return callback(new Error('You did not specify a collection or task to enable'));
    }

    api.put(enableTasksUrl, function(err, req, res, result) {
      if (res.statusCode === 304) {
        err = new Error('Collection already disabled')
      }
      callback(err, result);
    });
  };


  /**
   * Disable an individual task or a collection of tasks
   *
   * ## Examples:
   *
   *     // Enable a single task
   *     client.disableTasks({ task:'ummon.doAwesome' }, callback)
   *
   *     // Enable a collection
   *     client.disableTasks({ collection:'ummon' }, callback)
   *
   *
   * @param  {Object}   options  Object describing what to disable
   * @param  {Function} callback callback(err, result)
   */
  client.disableTasks = function(options, callback) {
    var disableTasksUrl;
    if (options.collection) {
      disableTasksUrl = apiUrls.collections+'/'+options.collection + '/disable'
    } else if (options.task) {
      disableTasksUrl = apiUrls.tasks+'/' + options.task + '/disable'
    } else {
      return callback(new Error('You did not specify a collection or task to disable'));
    }

    api.put(disableTasksUrl, function(err, req, res, result) {
      if (res.statusCode === 304) {
        err = new Error('Collection already disabled')
      }
      callback(err, result);
    });
  };


  /**
   * Return an individual task or a collection of tasks
   *
   * @param  {Object}   options  Object describing what to get
   * @param  {Function} callback callback(err, result)
   */
  client.getTasks = function(options, callback){
    if (!callback && "function" === typeof options) {
      callback = options;
      options = false;
    }
    // URL BUILDER!
    var taskurl;
    if (options.collection) {
      taskurl = apiUrls.collections + '/' + options.collection;
    } else if (options.task) {
      if (options.task.indexOf('.*') !== -1) { options.task = options.task.substr(0, options.task.length-2)}
      taskurl = apiUrls.tasks + '/' + options.task;
    } else {
      taskurl = apiUrls.tasks;
    }

    api.get(taskurl, function(err, req, res, result) {
      // console.log(err, result);
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  };


  /**
   * Create a task
   *
   * ## Example
   *
   *      client.createTask({
   *        collection:"ummon",
   *        name: "doAwesome",
   *        command: "sh fixTheWorld.sh",
   *        trigger: {time: '1 * * * *'}},
   *      callback)
   *
   * @param  {Object}   options  Object describing what to create
   * @param  {Function} callback callback(err, result)
   */
  client.createTask = function(config, callback){
    api.post(apiUrls.createTask, config, function(err, req, res, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  };


  /**
   * Update an existing task
   *
   * @param  {Object}   config   A tasks updated config object
   * @param  {Function} callback callback(err, result)
   */
  client.updateTask = function(config, callback){
    api.put(apiUrls.tasks + '/' + config.taskid, config, function(err, req, res, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  };


  /**
   * Delete a task
   *
   * @param  {String}   taskid
   * @param  {Function} callback callback(err)
   */
  client.deleteTask = function(taskid, callback){
    api.del(apiUrls.tasks + '/' + taskid, function(err, req, res) {
      callback(err);
    });
  };

  /**
   * Delete a collection, it's defaults and all tasks in it
   *
   * @param  {String}   collection
   * @param  {Function} callback   callback(err)
   */
  client.deleteCollection = function(collection, callback){
    api.del(apiUrls.collections + '/' + collection, function(err, req, res) {
      callback(err);
    });
  };

  return client;
};
