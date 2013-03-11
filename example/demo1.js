(function() {
  var Task, fs, taskObj, _;

  Task = require('../index');

  fs = require('fs');

  _ = require('underscore');

  taskObj = new Task({
    limit: 10,
    max: 0,
    timeOut: 5000,
    autoNext: true
  });

  (function() {
    var args, cbf, completeTotal, data, dataArr, errTotal, i, total, writeFile, _i, _j, _results;
    total = 500;
    dataArr = [];
    for (i = _i = 0; _i <= 100; i = ++_i) {
      dataArr.push('aojfoeajfoeaofe');
    }
    data = 'a';
    console.time('TEST');
    completeTotal = 0;
    errTotal = 0;
    writeFile = function(file, data, cbf) {
      return fs.writeFile(file, data, cbf);
    };
    cbf = function(err) {
      completeTotal++;
      if (err) {
        errTotal++;
      }
      if (completeTotal === total) {
        console.dir("errTotal:" + errTotal);
        return console.timeEnd('TEST');
      }
    };
    _results = [];
    for (i = _j = 0; 0 <= total ? _j < total : _j > total; i = 0 <= total ? ++_j : --_j) {
      args = ["/Users/Tree/tmp/" + i + ".txt", data, cbf];
      _results.push(taskObj.add(writeFile, args));
    }
    return _results;
  })();

}).call(this);
