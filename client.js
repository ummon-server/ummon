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

  var client = {};

  client.ps = function(callback){
    api.get('/ps', function(err, req, res, result) {
      assert.ifError(err);
      
      callback(result);
    });
  };

  return client;
};