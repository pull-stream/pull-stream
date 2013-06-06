var drain = exports.drain = function (read, op, done) {

  ;(function next() {
    var loop = true, cbed = false
    while(loop) {
      cbed = false
      read(null, function (end, data) {
        cbed = true
        if(end) {
          loop = false
          done && done(end === true ? null : end)
        }
        else if(op && false === op(data)) {
          loop = false
          read(true, done || function () {})
        }
        else if(!loop){
          next()
        }
      })
      if(!cbed) {
        loop = false
        return
      }
    }
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

