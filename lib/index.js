
/**!
* Copyright(c) 2013 vicanso 腻味
* MIT Licensed
*/


(function() {
  var Tasks, _,
    __slice = [].slice;

  _ = require('underscore');

  Tasks = (function() {
    /**
     * constructor Task的构造函数
     * @param  {Object} options 
     * @return {Task}
    */

    function Tasks(options) {
      var defaults, opts;
      defaults = {
        limit: 10,
        timeOut: 5000,
        autoNext: true
      };
      opts = _.extend(defaults, options);
      opts.tasks = [];
      opts.doing = 0;
      opts.doingTasks = [];
      if (opts.limit <= 0) {
        console.warn("The limit is forbidden to set less than 1, it will be set to default(10).");
        opts.limit = 10;
      }
      if (!(opts.max != null)) {
        opts.max = opts.limit * 10;
      }
      this.opts = opts;
    }

    /**
     * add 添加处理函数
     * @param {Function} handle 处理函数
     * @param {Array} args 参数列表
     * @param {Object} context 函数上下文作用域（handle函数的this指向的对象，默认为null）
     * @return {Task}
    */


    Tasks.prototype.add = function(handle, args, context) {
      var cbf, index, opts, se, task, tasks, _ref;
      if (context == null) {
        context = null;
      }
      if (!_.isFunction(handle) || !_.isArray(args)) {
        return this;
      }
      cbf = args.pop();
      if (!_.isFunction(cbf)) {
        return this;
      }
      opts = this.opts;
      tasks = opts.tasks;
      if (opts.max && tasks.length >= opts.max) {
        cbf(new Error('the tasks queue is full.'));
        console.warn("The tasks queue max is " + opts.max + ", now is full. If you don't want to limit, please set the max option with 0.");
        return this;
      }
      se = this._serialization(args);
      task = {
        handle: handle,
        se: se,
        context: context
      };
      if (opts.autoNext) {
        index = this._getDoingTaskIndex(task);
        if (~index) {
          task = opts.doingTasks[index];
          if ((_ref = task.cbfs) == null) {
            task.cbfs = [];
          }
          task.cbfs.push(cbf);
          return this;
        }
        cbf = this._wrapCompleteCbf(task, cbf);
      }
      args.push(cbf);
      task.args = args;
      tasks.push(task);
      this._do();
      return this;
    };

    /**
     * next 执行下一个handle函数
     * @return {Task}
    */


    Tasks.prototype.next = function() {
      var opts;
      opts = this.opts;
      opts.doing--;
      this._do();
      return this;
    };

    /**
     * set 设置Task的option
     * @param {String} key 要设置的属性名
     * @param {String, Number} value 要设置的属性值
     * @return {Task}
    */


    Tasks.prototype.set = function(key, value) {
      if (key === 'limit' && value <= 0) {
        console.warn("The limit is forbidden to set less than 1.");
        return this;
      }
      this.opts[key] = value;
      return this;
    };

    /**
     * _wrapCompleteCbf 封装回调函数，主要用于自动执行下一个任务的Task
     * @param {Object} task task的参数对象
     * @param  {Function} cbf 回调函数
     * @return {Fuction} 封装后的新回调函数
    */


    Tasks.prototype._wrapCompleteCbf = function(task, cbf) {
      var opts, self;
      self = this;
      opts = this.opts;
      cbf = _.wrap(cbf, function() {
        var args, func;
        func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!arguments.callee.isCalled) {
          func.apply(null, args);
          if (opts.autoNext) {
            self._removeDoingTask(task, args);
          }
          self.next();
        }
        return arguments.callee.isCalled = true;
      });
      return cbf;
    };

    /**
     * _do 开始执行任务,判断当前执行中的任务数，如果小于limit，则执行下一个（每次add和next都会调用do）
     * @return {Task}
    */


    Tasks.prototype._do = function() {
      var args, cbf, opts, task, timeOut;
      opts = this.opts;
      if (!this._isMaxTaskRunning()) {
        return this;
      }
      task = opts.tasks.shift();
      args = task.args;
      timeOut = opts.timeOut;
      opts.doing++;
      if (opts.autoNext) {
        this._addDoingTask(task);
      }
      task.handle.apply(task.context, args);
      if (timeOut) {
        cbf = _.last(args);
        _.delay(function() {
          return cbf(new Error('timeOut'));
        }, timeOut);
      }
      return this;
    };

    /**
     * _addDoingTask 添加正在进行中的task
     * @param {Object} task 任务描述{se : xxx, handle : xxx}
     * @param {Task}
    */


    Tasks.prototype._addDoingTask = function(task) {
      var doingTasks, handle, insertIndex, newDoingTask, opts, se;
      opts = this.opts;
      doingTasks = opts.doingTasks;
      se = task.se;
      handle = task.handle;
      newDoingTask = {
        se: se,
        handle: handle
      };
      insertIndex = _.sortedIndex(doingTasks, newDoingTask, function(task) {
        return task.se;
      });
      doingTasks.splice(insertIndex, 0, newDoingTask);
      return this;
    };

    /**
     * _getDoingTaskIndex 获取正在进行的task的index
     * @param  {Object} task task 任务描述{se : xxx, handle : xxx}
     * @return {Task}
    */


    Tasks.prototype._getDoingTaskIndex = function(task) {
      var doingTasks, findTask, insertIndex, opts;
      opts = this.opts;
      doingTasks = opts.doingTasks;
      insertIndex = _.sortedIndex(doingTasks, task, function(t) {
        return t.se;
      });
      findTask = doingTasks[insertIndex];
      if (!findTask || task.se !== findTask.se || task.handle !== findTask.handle) {
        insertIndex = -1;
      }
      return insertIndex;
    };

    /**
     * _removeDoingTask 删除正在进行的task
     * @param  {Object} removeTask 需要删除的task
     * @param  {Array} args 该task完成时的回调的一些参数
     * @return {Task}
    */


    Tasks.prototype._removeDoingTask = function(removeTask, args) {
      var cbfs, doingTasks, index, opts;
      opts = this.opts;
      doingTasks = opts.doingTasks;
      index = this._getDoingTaskIndex(removeTask);
      if (~index) {
        cbfs = doingTasks[index].cbfs;
        doingTasks.splice(index, 1);
        _.each(cbfs, function(cbf) {
          return cbf.apply(null, args);
        });
      }
      return this;
    };

    /**
     * _isMaxTaskRunning 判断是否已有limit数量的handle在执行了
     * @return {Boolean}
    */


    Tasks.prototype._isMaxTaskRunning = function() {
      var opts;
      opts = this.opts;
      if (!opts.limit || (opts.doing < opts.limit && opts.tasks.length > 0)) {
        return true;
      } else {
        return false;
      }
    };

    /**
     * _serialization 序列化参数列表（参数类型不为function）
     * @param  {Array} args 参数列表
     * @return {String}
    */


    Tasks.prototype._serialization = function(args) {
      var serializationList;
      serializationList = [];
      _.each(args, function(arg) {
        if (!_.isFunction(arg)) {
          if (_.isString(arg)) {
            return serializationList.push(arg);
          } else {
            return serializationList.push(JSON.stringify(arg));
          }
        }
      });
      return serializationList.join(',');
    };

    return Tasks;

  })();

  module.exports = Tasks;

}).call(this);
