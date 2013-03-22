var k = 0
var map = exports.map = 
function (read, map) {
  var _k = k++
  map = map || function (e) {return e}
  return function (end, cb) {
    read(end, function (end, data) {
      cb(end, !end ? map(data) : null)
    })
  }
}

var filter = exports.filter =
function (read, test) {
  //regexp
  if('object' === typeof test
    && 'function' === typeof test.test)
    test = test.test.bind(test)

  return function next (end, cb) {
    read(end, function (end, data) {
      if(!end && !test(data))
        return next(end, cb)
      cb(end, data)
    })
  }
}

var through = exports.through = 
function (read, op) {
  return function (end, cb) {
    return read(end, function (end, data) {
      op && op(data)
      cb(end, data)
    })
  }
}

var take = exports.take =
function (read, test) {
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

var highWaterMark = exports.highWaterMark = 
function (read, highWaterMark) {
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

