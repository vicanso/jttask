
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
     * @param {Array} arg∫s 参数列表
     * @param {Object} context 函数上下文作用域（handle函数的this指向的对象，默认为null）
     * @return {Task}
    */


    Tasks.prototype.add = function(handle, args, context) {
      var cbf, opts, tasks;
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
      if (opts.autoNext) {
        cbf = this._wrapCompleteCbf(cbf);
      }
      args.push(cbf);
      tasks.push({
        handle: handle,
        args: args,
        context: context
      });
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
     * @param  {Function} cbf 回调函数
     * @return {Fuction} 封装后的新回调函数
    */


    Tasks.prototype._wrapCompleteCbf = function(cbf) {
      var opts, self;
      self = this;
      opts = this.opts;
      cbf = _.wrap(cbf, function() {
        var args, func;
        func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!arguments.callee.isCalled) {
          func.apply(null, args);
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

    return Tasks;

  })();

  module.exports = Tasks;

}).call(this);
