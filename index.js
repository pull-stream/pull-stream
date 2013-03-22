
var readArray = exports.readArray = function (array) {
  var i = 0
  return function (reader) {
    reader(function (end, cb) {
      if(end)
        return cb && cb(end)
    
      cb(i >= array.length || null, array[i++])
    })
  }
}

var count = function () {
  var i = 0
  return function (reader) {
    return reader(function (end, cb) {
      if(end) return cb && cb(end)
      cb(null, i++)
    })
  }
}

var destack = function (n) {
  var i = 0; n = n || 10, waiting = [], queued = false, ended = false
  return function (readable) {
    return function (reader) {
      return reader(function (end, cb) {
        ended = ended || end
        if(i ++ < n) {
          return readable(end, cb)
        } else {
          process.nextTick(function () {
             i = 0
             readable(end, cb)
          })
        }
      })
    }
  }
}

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

var drain = exports.drain = function (op) {
  return function (readable) {
    readable(null, function read (err, data) {
      if(err) return
      op && op(data)
      readable(null, read)
    })
    //write-only
  }
}

var through = function () {
  return function (readable) {
    return function (reader) {
      return reader(function (end, cb) {
        return reader(end, cb)
      })
    }
  }
}

function pipeable (_reader) {
  return function () {
    var args = [].slice.call(arguments)
    return function (readable) {
      args.unshift(readable)
      return function (reader) {
        return reader(_reader.apply(null, args))
      }
    }
  }
}

var dumb = pipeable(function (readable, op) {
  return function (end, cb) {
    return readable(end, function (end, data) {
      op && op(data)
      cb(end, data)
    })
  }
})

//var smart = pipeable(dumb)

var take = pipeable(function (readable, test) {
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
    return readable(null, function (end, data) {
      if(end || !test(data)) return readable(end || true, cb)
      return cb(null, data)
    })
  }
})

var nextTick = process.nextTick
var highWaterMark = pipeable(function (readable, highWaterMark) {
  var buffer = [], waiting = [], ended, reading = false
  highWaterMark = highWaterMark || 10

  function read () {
    while(waiting.length && (buffer.length || ended))
      waiting.shift()(ended, ended ? null : buffer.shift())
  }

  function next () {
    if(ended || reading || buffer.length >= highWaterMark)
      return
    reading = true
    return readable(ended, function (end, data) {
      reading = false
      ended = ended || end
      if(data != null) buffer.push(data)
      
      next(); read()
    })
  }

  process.nextTick(next)

  return function (end, cb) {
    ended = ended || end
    waiting.push(cb)

    next(); read()
  }
})

function writeArray(cb) {
  var array = []
  return function (readable) {
    ;(function next () {
      return readable(null, function (end, data) {
        if(end) return cb(end == true ? null : end, array)
        array.push(data)
        next()
      })
    })()
    return function () { throw new Error('write-only') }
  }
}

/*
var asyncMapSerial = pipeable(function (readable, map) {
  var reading = false
  return function (end, cb) {
    if(reading) throw new Error('one at a time, please!')
    reading == true
    return readable(end, function (end, data) {
      map(data, function (err, data) {
        reading = false
        

      })
    })
  }
})
*/

if(!module.parent)

  count()
    (destack ())
    (take(20))
    (highWaterMark(2))
    (writeArray(console.log))
//    (drain(console.log))

/*  (function (readable) {
    return readable(null, function next (e, d) {
      if (e) return
      return readable(e, next)
    })
  })*/
//*/
//  drain (destack (count()), console.log)

