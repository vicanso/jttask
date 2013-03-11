Task = require '../index'
fs = require 'fs'
_ = require 'underscore'

taskObj = new Task {
  limit : 10
  max : 0
  timeOut : 5000
  autoNext : true
}

do () ->
  total = 500 
  dataArr = []
  for i in [0..100]
    dataArr.push 'aojfoeajfoeaofe'
  data = 'a'
  console.time 'TEST'
  completeTotal = 0
  errTotal = 0
  writeFile = (file, data, cbf) ->
    fs.writeFile file, data, cbf
  cbf = (err) ->
    completeTotal++
    if err
      errTotal++
    if completeTotal == total
      console.dir "errTotal:#{errTotal}"
      console.timeEnd 'TEST'
  for i in [0...total]
    args = ["/Users/Tree/tmp/#{i}.txt", data, cbf]
    taskObj.add writeFile, args