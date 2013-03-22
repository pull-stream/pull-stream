var map = function (map) {
  map = map || function (e) {return e}
  return function (readable) {
    return function (reader) {
      return reader(function (end, cb) {
        readable(end, function (end, data) {
          cb(end, map(data))
        })
      })
    }
  }
}

var dumb = function (read, op) {
  return function (end, cb) {
    return read(end, function (end, data) {
      op && op(data)
      cb(end, data)
    })
  }
}

var take = function (read, test) {
  var ended = false
  if('number' === typeof test) {
    var n = test; test = function () {
      return n-- > 0
    }
  }
  return function (end, cb) {
    if(end) {
      if(!ended) return ended = end, readable(end, cb)
      cb(ended)
    }
    return read(null, function (end, data) {
      if(end || !test(data)) return read(end || true, cb)
      return cb(null, data)
    })
  }
}


var nextTick = process.nextTick
var highWaterMark = function (read, highWaterMark) {
  var buffer = [], waiting = [], ended, reading = false
  highWaterMark = highWaterMark || 10

  function readAhead () {
    while(waiting.length && (buffer.length || ended))
      waiting.shift()(ended, ended ? null : buffer.shift())
  }

  function next () {
    if(ended || reading || buffer.length >= highWaterMark)
      return
    reading = true
    return read(ended, function (end, data) {
      reading = false
      ended = ended || end
      if(data != null) buffer.push(data)
      
      next(); readAhead()
    })
  }

  nextTick(next)

  return function (end, cb) {
    ended = ended || end
    waiting.push(cb)

    next(); readAhead()
  }
}

