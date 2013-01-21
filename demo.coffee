Task = require './index'
fs = require 'fs'
_ = require 'underscore'

taskObj = new Task {
  limit : 10
  timeOut : 5000
  autoNext : true
}

# 读取文件，因为读取的文件比较快，为了方便演示，因些将回调函数通过延时调用
readFile = (file, cbf) ->
  fs.readFile file, (err, data) ->
    setTimeout () ->
      cbf err, data
    , 3000


do () ->
  total = 0
  timer = setInterval () ->
    total++
    if total > 50
      clearInterval timer
      return
    file = _.random(0, 5) + 'test.txt'
    cbf = (err, data) ->
      console.dir err
    args = [file, cbf]
    taskObj.add readFile, args

