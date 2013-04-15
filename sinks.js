var u    = require('./util')
var prop = u.prop
var id   = u.id

var drain = exports.drain = function (read, op, done) {
  ;(function next() {
    var sync = true, returned = false, loop = true
    do {
      returned = false; sync = true
      read(null, function (err, data) {
        returned = true
        
        if(err) {
          done && done(err === true ? null : err)
          return loop = false
        }

        if(op) {
          //return false to abort!
          if(false === op(data)) {
            loop = false
            return read(true, done || function () {})
          }
        }
        if(!sync) next()
      })
      sync = false
      if(!returned) return
    } while (loop);
  })()
}

var find = 
exports.find = function (read, test, cb) {
  var ended = false
  if(!cb)
    cb = test, test = id
  else
    test = prop(test) || id
  drain(read, function (data) {
    if(test(data)) {
      ended = true
      cb(null, data)
    return false
    }
  }, function (err) {
    if(ended) return //already called back
    cb(err === true ? null : err, null)
  })
}

var reduce = exports.reduce = 
function (read, reduce, acc, cb) {
  drain(read, function (data) {
    acc = reduce(acc, data)
  }, function (err) {
    cb(err, acc)
  })
}

var collect = exports.collect = exports.writeArray =
function (read, cb) {
  return reduce(read, function (arr, item) {
    arr.push(item)
    return arr
  }, [], cb)
}

//if the source callsback sync, then loop
//rather than recurse

var onEnd = exports.onEnd = function (read, done) {
  return drain(read, null, done)
}

var log = exports.log = function (read, done) {
  return drain(read, console.log.bind(console), done)
}

