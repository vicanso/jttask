(function() {
  var Task, fs, readFile, taskObj, _;

  Task = require('./index');

  fs = require('fs');

  _ = require('underscore');

  taskObj = new Task({
    limit: 10,
    timeOut: 5000,
    autoNext: true
  });

  readFile = function(file, cbf) {
    return fs.readFile(file, function(err, data) {
      return setTimeout(function() {
        return cbf(err, data);
      }, 3000);
    });
  };

  (function() {
    var timer, total;
    total = 0;
    return timer = setInterval(function() {
      var args, cbf, file;
      total++;
      if (total > 50) {
        clearInterval(timer);
        return;
      }
      file = _.random(0, 5) + 'test.txt';
      cbf = function(err, data) {
        return console.dir(err);
      };
      args = [file, cbf];
      return taskObj.add(readFile, args);
    });
  })();

}).call(this);
