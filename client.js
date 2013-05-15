'use strict';


/**
 * Module dependencies.
 */
var assert = require('assert');
var restify = require('restify');


module.exports = function(options){
  var config = {version: '*'};

  for (var item in options){
    config[item] = options[item];
  }
  
  var api = restify.createJsonClient(config);

  var url = {};
  url.ps = '/ps';
  url.log = '/log';
  url.tasks = '/tasks';
  url.createTask = url.tasks + '/new';

  var client = {};


  client.ps = function(pid, callback){
    if (!callback && 'function' === typeof pid){
      callback = pid;
    }

    api.get(url.ps, function(err, req, res, result) {
      assert.ifError(err);

      callback(result);
      api.close();
    });
  };


  client.showLog = function(filter, callback){
    if (!callback && 'function' === typeof filter){
      callback = filter;
    }

    var key = Object.keys(filter)[0];
    var val = filter[key];

    var logUrl = (key) ? url.log+'/'+key+'/'+val : url.log;

    api.get(logUrl, function(err, req, res, result) {
      assert.ifError(err);

      callback(res.body); // This is weird that result is empty and res.body isn't
      api.close();
    });
  };


  client.getTasks = function(filter, callback){
    var taskurl = (filter) ? url.tasks+'/'+filter : url.tasks;
    console.log(taskurl);
    api.get(taskurl, function(err, req, res, result) {
      assert.ifError(err);

      callback(result);
      api.close();
    });
  };

  
  client.createTask = function(config, callback){
    api.post(url.createTask, config, function(err, req, res, result) {
      assert.ifError(err);

      callback(result);
      api.close();
    });
  };


  client.updateTask = function(config, callback){
    api.get(url.tasks + '/' + taskid, function(err, req, res, result) {
      assert.ifError(err);

      callback(result);
      api.close();
    });
  };


  client.deleteTask = function(taskid, callback){
    api.get(url.tasks + '/' + taskid, function(err, req, res, result) {
      assert.ifError(err);

      callback(result);
      api.close();
    });
  };

  return client;
};