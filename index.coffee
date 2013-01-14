###*!
* Copyright(c) 2013 vicanso 腻味
* MIT Licensed
###

_ = require 'underscore'

class Tasks
  ###*
   * constructor Task的构造函数
   * @param  {Object} options 
   * @return {Task}
  ###
  constructor : (options) ->
    defaults = 
      limit : 10
      timeOut : 5000
      autoNext : true
    opts = _.extend defaults, options
    opts.tasks = []
    opts.doing = 0
    if opts.limit <= 0
      console.warn "The limit is forbidden to set less than 1, it will be set to default(10)."
      opts.limit = 10
    if !opts.max?
      opts.max = opts.limit * 10
    @opts = opts
  ###*
   * add 添加处理函数
   * @param {Function} handle 处理函数
   * @param {Array} arg∫s 参数列表
   * @param {Object} context 函数上下文作用域（handle函数的this指向的对象，默认为null）
   * @return {Task}
  ###
  add : (handle, args, context = null) ->
    if !_.isFunction(handle) || !_.isArray(args)
      return @
    cbf = args.pop()
    if !_.isFunction cbf
      return @
    opts = @opts
    tasks = opts.tasks
    if opts.max && tasks.length >= opts.max
      cbf new Error 'the tasks queue is full.'
      console.warn "The tasks queue max is #{opts.max}, now is full. If you don't want to limit, please set the max option with 0."
      return @
    if opts.autoNext
      cbf = @_wrapCompleteCbf cbf
    args.push cbf
    tasks.push {
      handle : handle
      args : args
      context : context
    }
    @_do()
    return @
  ###*
   * next 执行下一个handle函数
   * @return {Task}
  ###
  next : () ->
    opts = @opts
    opts.doing--
    @_do()
    return @
  ###*
   * set 设置Task的option
   * @param {String} key 要设置的属性名
   * @param {String, Number} value 要设置的属性值
   * @return {Task}
  ###
  set : (key, value) ->
    if key == 'limit' && value <= 0
      console.warn "The limit is forbidden to set less than 1."
      return @
    @opts[key] = value
    return @
  ###*
   * _wrapCompleteCbf 封装回调函数，主要用于自动执行下一个任务的Task
   * @param  {Function} cbf 回调函数
   * @return {Fuction} 封装后的新回调函数
  ###
  _wrapCompleteCbf : (cbf) ->
    self = @
    opts = @opts
    cbf = _.wrap cbf, (func, args...) ->
      if !arguments.callee.isCalled
        func.apply null, args
        self.next()
      arguments.callee.isCalled = true
    return cbf
  ###*
   * _do 开始执行任务,判断当前执行中的任务数，如果小于limit，则执行下一个（每次add和next都会调用do）
   * @return {Task}
  ###
  _do : () ->
    opts = @opts
    if !@_isMaxTaskRunning()
      return @
    task = opts.tasks.shift()
    args = task.args
    timeOut = opts.timeOut
    opts.doing++
    task.handle.apply task.context, args
    if timeOut
      cbf = _.last args
      _.delay () ->
        cbf new Error 'timeOut'
      , timeOut
    return @
  ###*
   * _isMaxTaskRunning 判断是否已有limit数量的handle在执行了
   * @return {Boolean}
  ###
  _isMaxTaskRunning : () ->
    opts = @opts
    if !opts.limit || (opts.doing < opts.limit && opts.tasks.length > 0)
      return true
    else
      return false



module.exports = Tasks
