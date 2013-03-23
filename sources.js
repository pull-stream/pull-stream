
var readArray = exports.readArray = function (array) {
  var i = 0
  return function (end, cb) {
    if(end)
      return cb && cb(end)
  
    cb(i >= array.length || null, array[i++])
  }
}

var count = function () {
  var i = 0
  return function (end, cb) {
    if(end) return cb && cb(end)
    cb(null, i++)
  }
}

var infinite = exports.infinite = 
function (generate) {
  generate = generate || Math.random
  return function (end, cb) {
    if(end) return cb && cb(end)
    return cb(null, generate())
  }
}
var defer = exports.defer = function () {
  var _read, _cb, _end

  var read = function (end, cb) {
    if(_cb && !_read) throw new Error(
      'do not read twice' +
      'without waiting for callback'
    )
    if(_read) return _read(end, cb)
    _end = end, _cb = cb
  }
  read.resolve = function (read) {
    if(_read) throw new Error('already resolved')
    _read = read
    if(_cb) _read(_end, _cb)
  }
  read.abort = function(err) {
    read.resolve(function (_, cb) {
      cb(err || true)
    })
  }
  return read
}

var PushBuffer = exports.PushBuffer = function () {
  var buffer = [], cbs = [], waiting = [], ended

  function drain() {
    while(waiting.length && (buffer.length || ended)) {
      var data = buffer.shift()
      var cb   = cbs.shift()

      waiting.shift()(ended, data)
      cb && cb(ended)
    }
  }

  function read (end, cb) {
    ended = ended || end
    waiting.push(cb)
    drain()
  }

  read.push = function (data, cb) {
    buffer.push(data); cbs.push(cb)
    drain()
  }

  read.end = function (end, cb) {
    if('function' === typeof end)
      cb = end, end = true
    ended = ended || end || true; cbs.push(cb)
    drain()
  }

  return read

}

var depthFirst = exports.depthFirst =
function (start, createStream) {
  var reads = []

  reads.unshift(createStream(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        //if this stream has ended, go to the next queue
        reads.shift()
        return next(null, cb)
      }
      reads.unshift(createStream(data))
      cb(end, data)
    })
  }
}
//width first is just like depth first,
//but push each new stream onto the end of the queue
var widthFirst = exports.widthFirst = 
function (start, createStream) {
  var reads = []

  reads.push(createStream(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        return next(null, cb)
      }
      reads.push(createStream(data))
      cb(end, data)
    })
  }
}


var leafFirst = exports.leafFirst = 
function (start, createStream) {
  var reads = []
  var output = []
  reads.push(createStream(start))
  
  return function next (end, cb) {
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        if(!output.length)
          return cb(true)
        return cb(null, output.shift())
      }
      reads.unshift(createStream(data))
      output.unshift(data)
      next(null, cb)
    })
  }
}

