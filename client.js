'use strict';


/**
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


  client.basicAuth = function(user, pass){
    api.basicAuth(user, pass);
  };


  client.ps = function(pid, callback){
    if (!callback && 'function' === typeof pid){
      callback = pid;
    }

    api.get(apiUrls.ps, function(err, req, res, result) {
      callback(err, result);
      api.close();
    });
  };


  client.getStatus = function(callback) {
    api.get(apiUrls.status, function(err, req, res, result) {
      callback(err, result);
      api.close();
    })
  };


  client.getConfig = function(callback) {
    api.get(apiUrls.config, function(err, req, res, result) {
      callback(err, result);
      api.close();
    })
  };

  client.setConfig = function(options, callback) {
    var setConfigUrl = url.parse(apiUrls.config);
    setConfigUrl.query = options;
    setConfigUrl = url.format(setConfigUrl);
    api.put(setConfigUrl, function(err, req, res, result) {
      callback(err, result);
      api.close();
    })
  };


  client.showLog = function(options, callback){
    if (!callback && 'function' === typeof options){
      callback = options;
    }

    var key = Object.keys(options.filter)[0];
    var val = options[key];

    var logUrl = (key) ? apiUrls.log+'/'+key+'/'+val : apiUrls.log;
    logUrl+="?lines="+options.lines;
    console.log(logUrl)
    api.get(logUrl, function(err, req, res, result) {
      console.log(err, result.length)
      callback(err, res.body); // This is weird that result is empty and res.body isn't
      api.close();
    });
  };

  client.getCollectionDefaults = function(collection, callback) {
    api.get(apiUrls.collections+'/'+collection+'/defaults', function(err, req, res, result) {
      callback(err, result);
      api.close();
    });
  };


  client.setCollectionDefaults = function(collection, config, callback) {
    api.put(apiUrls.collections+'/'+collection+'/defaults', config, function(err, req, res, result) {
      callback(err, result);
      api.close();
    });
  };


  client.setTasks = function(collection, config, callback) {
    api.put(apiUrls.collections+'/'+collection, config, function(err, req, res, result) {
      callback(err, result);
      api.close();
    });
  };


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
      callback(err, result);
      api.close();
    });
  };


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
      callback(err, result);
      api.close();
    });
  };


  client.getTasks = function(options, callback){
    if (!callback && "function" === typeof options) {
      callback = options;
      options = false;
    }
    // URL BUILDER!
    var taskurl;
    if (options.collection) {
      taskurl = apiUrls.collections + '/' + options.collection;
    } else if (options.all) {
      taskurl = apiUrls.tasks;
    } else if (options.task) {
      taskurl = apiUrls.tasks + '/' + options.task;
    } else {
      return callback('What am I supposed to show? If you want all tasks use --all');
    }

    api.get(taskurl, function(err, req, res, result) {
      // console.log(err, result);
      if (err) {
        return callback(err);
      }

      callback(null, result);
      // api.close();
    });
  };


  client.createTask = function(config, callback){
    api.post(apiUrls.createTask, config, function(err, req, res, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result);
      api.close();
    });
  };


  client.updateTask = function(config, callback){
    api.put(apiUrls.tasks + '/' + config.taskid, config, function(err, req, res, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result);
      api.close();
    });
  };


  client.deleteTask = function(taskid, callback){
    api.del(apiUrls.tasks + '/' + taskid, function(err, req, res) {
      callback(err);
      api.close();
    });
  };

  return client;
};
