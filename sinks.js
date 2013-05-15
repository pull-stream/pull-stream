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

var onEnd = exports.onEnd = function (read, done) {
  return drain(read, null, done)
}

var log = exports.log = function (read, done) {
  return drain(read, function (data) {
    console.log(data)
  }, done)
}

