# jttask - node.js的任务操作（用于限制同类型操作的并发，适合那种动态增加的任务，则又不希望并发的操作太多，如查询数据库之类） 

## constructor options
```js
limit : 10    //限定并发数为，默认为10，limit不可以限定为0，如果不需要limit的，那就直接调用，而不应该使用Task
timeOut : 5000  //handle的超时，如果开始一个handle之后，多长时间没callback，那么就超时（如果不希望设置超时，将其设置为0)
autoNext : true  //自动开始下一任务（如果希望自己控制下一任务的开始，请设置为false，并且自己调用next()方法
max : limit * 10  //限制添加进来的等待handle总数，当等待执行的数量已达到max，则新add进来的handle并不进入队列，直接执行callback（且带一个Error参数），如果不设置，则默认为limit的10倍
```

## Demo
```js
var Task = require('jttask');
var fs = require('fs');
taskObj = new Task({
  limit : 10, 
  timeOut : 5000,   
  autoNext : true   
});

//读取文件，因为读取的文件比较快，为了方便演示，因些将回调函数通过延时调用
var readFile = function(file, cbf){
  fs.readFile(file, function(err, data){
    setTimeout(function(){
      cbf(err, data);
    }, 3000);
  });
};

var start = function(){
  var total = 0;
  var timer = setInterval(function(){
    total++;
    if(total > 100){
      clearInterval(timer);
      return ;
    }
    var file = 'test.txt';
    var cbf = function(err, data){
      console.dir(err);
    };
    var args = [file, cbf];
    taskObj.add(readFile, args);
  }, 50);
  
};
start();
```