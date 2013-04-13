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

        op && op(data)

        if(!sync) next()
      })
      sync = false
      if(!returned) return
    } while (loop);
  })()
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

