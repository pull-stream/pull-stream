
var reduce = exports.reduce = 
function (read, reduce, acc, cb) {
  read(null, function next (end, data) {
    if(end) return cb(end === true ? null : end, acc)
    acc = reduce(acc, data)
    read(null, next)
  })
}

var collect = exports.collect = exports.writeArray =
function (read, cb) {
  return reduce(read, function (arr, item) {
    arr.push(item)
    return arr
  }, [], cb)
}


var onEnd = exports.onEnd = function (read, done) {
 return read(null, function next (err, data) {
    if(err) return done(err)
    read(null, next)
  })
}

var drain = exports.drain = function (read, op, done) {
  return read(null, function next (err, data) {
    if(err) return done && done(err)
    op && op(data)
    read(null, next)
  })
}

var log = exports.log = function (read, done) {
  return drain(read, console.log.bind(console), done)
}

