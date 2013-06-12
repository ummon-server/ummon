var test = require("tap").test;

var fork = require('child_process').fork;
var ummon;
var server;

//                    Construct!
// - - - - - - - - - - - - - - - - - - - - - - - - - 
test('Setup', function(t){
  server = fork('../node_modules/ummon-server/server.js');
  ummon = require('../client')({url: 'http://localhost:8888'});
  t.end();
});


test('Show processes', function(t){
  t.plan(1);

  ummon.ps(function(data){
    t.ok(data.workers, 'ps returns data');
  });
});


test('Return logs', function(t){
  t.plan(1);

  ummon.showLog({'collection':'default'}, function(data){
    t.ok(data, 'showLog returns data');
  });
});


test('Create a task', function(t){
  t.plan(1);
  var task = {"name":"test", "command":"echo hello", "trigger": {"time":"* * * * *"}};
  ummon.createTask(task, function(data){
    t.ok(data, 'createTask returns data');
  });
});


test('Show a task', function(t){
  t.plan(1);
  ummon.getTasks('default.test', function(err, data){
    t.ok(data, 'createTask returns data');
  });
});


test('Teardown', function(t){
  server.kill();
  setImmediate(function() {
    process.exit();
  });
  t.end();
});

process.on('uncaughtException', function(err) {
  server.kill();
});