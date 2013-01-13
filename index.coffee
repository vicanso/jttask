###*!
* Copyright(c) 2013 vicanso 腻味
* MIT Licensed
###

_ = require 'underscore'

class Tasks
  constructor : (options) ->
    defaults = 
      limit : 10
      timeout : 5000
      autoNext : true
    @opts = _.extend defaults, options
    @opts.tasks = []
    @opts.doing = 0
  add : (handle, args, context = null) ->
    if !_.isFunction(handle) || !_.isArray(args)
      return @
    cbf = args.pop()
    if !_.isFunction cbf
      return @
    opts = @opts
    if opts.autoNext
      cbf = @_wrapCompleteCbf cbf
    args.push cbf
    tasks = opts.tasks
    tasks.push {
      handle : handle
      args : args
      context : context
    }
    @_do()
  next : () ->
    opts = @opts
    opts.doing--
    @_do()
  set : (key, value) ->
    @opts[key] = value
    return @
  _wrapCompleteCbf : (cbf) ->
    self = @
    opts = @opts
    cbf = _.wrap cbf, (func, args...) ->
      console.dir 'cbf....'
      if !arguments.callee.isCalled
        func.apply null, args
        self.next()
      arguments.callee.isCalled = true
    return cbf
  _do : () ->
    opts = @opts
    if !@_isMaxTaskRunning()
      return @
    task = opts.tasks.shift()
    args = task.args
    timeout = opts.timeout
    opts.doing++
    task.handle.apply task.context, args
    if timeout
      cbf = _.last args
      _.delay () ->
        cbf new Error 'timeout'
      , timeout
  _isMaxTaskRunning : () ->
    opts = @opts
    if !opts.limit || (opts.doing < opts.limit && opts.tasks.length > 0)
      return true
    else
      return false

# task = new Task {
#   timeout : 200
# }
# obj = {
#   a : 'tttt'
# }
# for i in [0..15]
#   cbf = (err, index) ->
#     console.dir "complete:#{index}"
#   handle = (index, cbf) ->
#     console.dir @
#     setTimeout () ->
#       cbf null, index
#     , 6000
#   task.add handle, [i, cbf], obj

module.exports = Tasks
