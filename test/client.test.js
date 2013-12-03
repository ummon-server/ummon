var http = require('http');
var test = require('tap').test;


var testCollection = 'ummon-client-test';
var ummon = require('../client')({url: 'http://localhost:8888'});
var config;

test('Setup', function(t){
  t.plan(1);
  // Clear out collection if it exists
  http.request({
    port: 8888,
    method: 'DELETE',
    path: '/collections/' + testCollection
  }, function (res) {
    t.ok(true, 'Setup complete');
  }).on('error', function (e) {
    // Bail on connection error -- probably no server running
    throw e;
  }).end();
});


test('Create a task', function(t){
  t.plan(2);
  var task = {
    name: 'hello',
    collection: testCollection,
    command: 'echo hello',
    trigger: {time: '* * * * *'}
  };
  ummon.createTask(task, function(err, data){
    t.ifError(err, 'No error from createTask');
    t.equal(data.message, 'Task ' + testCollection + '.hello successfully created', 'createTask tells us a task was created');
  });
});


test('Get a task', function(t){
  t.plan(2);
  ummon.getTasks({task: testCollection + '.hello'}, function(err, data){
    t.ifError(err, 'No error from getTasks');
    t.equal(data.collections[0].tasks.hello.command, 'echo hello', 'getTasks returns the correct command');
  });
});


test('Get collection config', function(t){
  t.plan(2);
  ummon.getCollectionConfig(testCollection, function(err, data){
    t.ifError(err, 'No error from getCollectionConfig');
    t.equal(data.tasks.hello.command, 'echo hello', 'getCollectionConfig returns the collection');
    // Save config for the set config test
    config = data;
  });
});


test('Delete the collection', function(t){
  t.plan(1);
  ummon.deleteCollection(testCollection, function(err){
    t.ifError(err, 'No error from deleteCollection');
  });
});


test('Set collection config', function(t){
  t.plan(2);
  ummon.setCollectionConfig(testCollection, config, function(err, data){
    t.ifError(err, 'No error from getCollectionConfig');
    t.equal(data.collections[0].tasks.hello.command, 'echo hello', 'Set collection returns the collection');
  });
});


test('Return logs', function(t){
  t.plan(2);
  // Only grab the logs from a second ago
  var aSecondAgo = new Date(Date.now() - 1000);
  ummon.showLog({from: aSecondAgo.toISOString()}, function(err, data){
    t.ifError(err, 'No error from showLog');
    // Get last non-empty line
    var lastLine = data.split('\n').filter(function (line) {return line}).pop();
    t.equal(JSON.parse(lastLine).apiUrl.substr(0, 4), '/log', 'showLog returns data');
  });
});


test('Teardown', function(t){
  t.plan(1);
  // Clean up by deleting the collection
  http.request({
    port: 8888,
    method: 'DELETE',
    path: '/collections/' + testCollection
  }, function (res) {
    setImmediate(function() {
      process.exit();
    });
    t.ok(true, 'Teardown complete');
  }).end();
});
