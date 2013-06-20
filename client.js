'use strict';


/**
 * Module dependencies.
 */
var assert = require('assert');
var restify = require('restify');


module.exports = function(options){
  var url = {};
  url.ps = '/ps';
  url.log = '/log';
  url.tasks = '/tasks';
  url.createTask = url.tasks + '/new';
  url.collections = '/collections';

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

    api.get(url.ps, function(err, req, res, result) {
      callback(err, result);
      api.close();
    });
  };


  client.showLog = function(options, callback){
    if (!callback && 'function' === typeof options){
      callback = options;
    }

    var key = Object.keys(options.filter)[0];
    var val = options[key];

    var logUrl = (key) ? url.log+'/'+key+'/'+val : url.log;
    logUrl+="?lines="+options.lines;
    api.get(logUrl, function(err, req, res, result) {
      callback(err, res.body); // This is weird that result is empty and res.body isn't
      api.close();
    });
  };


  client.getTask = function(options, callback){
    if (!callback && "function" === typeof options) {
      callback = options;
      options = false;
    }
    // URL BUILDER!
    var taskurl;
    if (options.collection) {
      taskurl = url.collections + '/' + options.collection;
    } else if (options.all) {
      taskurl = url.tasks;
    } else if (options.task) { 
      taskurl = url.tasks + '/' + options.task;
    } else {
      return callback('What am I supposed to show? If you want all tasks use --all');
    }
    
    api.get(taskurl, function(err, req, res, result) {
      // console.log(err, result);
      if (err) {
        return callback(err);
      }
  
      callback(null, result);
      api.close();
    });
  };

  
  client.createTask = function(config, callback){
    api.post(url.createTask, config, function(err, req, res, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result);
      api.close();
    });
  };


  client.updateTask = function(config, callback){
    api.put(url.tasks + '/' + config.taskid, config, function(err, req, res, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result);
      api.close();
    });
  };


  client.deleteTask = function(taskid, callback){
    api.del(url.tasks + '/' + taskid, function(err, req, res) {
      callback(err);
      api.close();
    });
  };

  return client;
};