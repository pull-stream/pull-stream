'use strict';

function id (item) { return item }

function prop (key) {
  return (
    'string' == typeof key
    ? function (data) { return data[key] }
    : 'object' === typeof key && 'function' === typeof key.exec //regexp
    ? function (data) { var v = map.exec(data); return v && v[0] }
    : key
  )
}

function tester (test) {
  return (
    'object' === typeof test && 'function' === typeof test.test //regexp
    ? function (data) { return test.test(data) }
    : prop (test) || id
  )
}

var sources = require('./sources')
var sinks = require('./sinks')

var map = exports.map =

function (map) {
  if(!map) return id
  map = prop(map)
  return function (read) {
    return function (abort, cb) {
      read(abort, function (end, data) {
        try {
        data = !end ? map(data) : null
        } catch (err) {
          return read(err, function () {
            return cb(err)
          })
        }
        cb(end, data)
      })
    }
  }
}

var asyncMap = exports.asyncMap =
function async (map) {
  if(!map) return id
  map = prop(map)
  var busy = false, abortCb, aborted
  return function (read) {
    return function next (abort, cb) {
      if(aborted) return cb(aborted)
      if(abort) {
        aborted = abort
        if(!busy) read(abort, cb)
        else read(abort, function () {
          //if we are still busy, wait for the mapper to complete.
          if(busy) abortCb = cb
          else cb(abort)
        })
      }
      else
        read(null, function (end, data) {
          if(end) {
            cb(end)
            if(abortCb) cb(end, data)
          }
          else {
            busy = true
            map(data, function (err, data) {
              busy = false
              if(aborted) {
                cb(aborted)
                abortCb(aborted)
              }
              else if(err) next (err, cb)
              else cb(null, data)
            })
          }
        })
    }
  }
}


function asyncMap (map) {
  if(!map) return id //when read is passed, pass it on.
  return function (read) {
    return function (end, cb) {
      if(end) return read(end, cb) //abort
      read(null, function (end, data) {
        if(end) return cb(end, data)
        map(data, cb)
      })
    }
  }
}

var filter = exports.filter =
function (test) {
  //regexp
  test = tester(test)
  return function (read) {
    return function next (end, cb) {
      var sync, loop = true
      while(loop) {
        loop = false
        sync = true
        read(end, function (end, data) {
          if(!end && !test(data))
            return sync ? loop = true : next(end, cb)
          cb(end, data)
        })
        sync = false
      }
    }
  }
}

var filterNot = exports.filterNot =
function (test) {
  test = tester(test)
  return filter(function (data) { return !test(data) })
}

//a pass through stream that doesn't change the value.
var through = exports.through =
function (op, onEnd) {
  var a = false

  function once (abort) {
    if(a || !onEnd) return
    a = true
    onEnd(abort === true ? null : abort)
  }

  return function (read) {
    return function (end, cb) {
      if(end) once(end)
      return read(end, function (end, data) {
        if(!end) op && op(data)
        else once(end)
        cb(end, data)
      })
    }
  }
}

//read a number of items and then stop.
var take = exports.take =
function (test, opts) {
  opts = opts || {}
  var last = opts.last || false // whether the first item for which !test(item) should still pass
  var ended = false
  if('number' === typeof test) {
    last = true
    var n = test; test = function () {
      return --n
    }
  }

  return function (read) {

    function terminate (cb) {
      read(true, function (err) {
        last = false; cb(err || true)
      })
    }

    return function (end, cb) {
      if(ended)            last ? terminate(cb) : cb(ended)
      else if(ended = end) read(ended, cb)
      else
        read(null, function (end, data) {
          if(ended = ended || end) {
            //last ? terminate(cb) :
            cb(ended)
          }
          else if(!test(data)) {
            ended = true
            last ? cb(null, data) : terminate(cb)
          }
          else
            cb(null, data)
        })
    }
  }
}

//drop items you have already seen.
var unique = exports.unique = function (field, invert) {
  field = prop(field) || id
  var seen = {}
  return filter(function (data) {
    var key = field(data)
    if(seen[key]) return !!invert //false, by default
    else seen[key] = true
    return !invert //true by default
  })
}

//passes an item through when you see it for the second time.
var nonUnique = exports.nonUnique = function (field) {
  return unique(field, true)
}

//convert a stream of arrays or streams into just a stream.
var flatten = exports.flatten = function () {
  return function (read) {
    var _read
    return function (abort, cb) {
      if (abort) { //abort the current stream, and then stream of streams.
        _read ? _read(abort, function(err) {
          read(err || abort, cb)
        }) : read(abort, cb)
      }
      else if(_read) nextChunk()
      else nextStream()

      function nextChunk () {
        _read(null, function (err, data) {
          if (err === true) nextStream()
          else if (err) {
            read(true, function(abortErr) {
              // TODO: what do we do with the abortErr?
              cb(err)
            })
          }
          else cb(null, data)
        })
      }
      function nextStream () {
        _read = null
        read(null, function (end, stream) {
          if(end)
            return cb(end)
          if(Array.isArray(stream) || stream && 'object' === typeof stream)
            stream = sources.values(stream)
          else if('function' != typeof stream)
            throw new Error('expected stream of streams')
          _read = stream
          nextChunk()
        })
      }
    }
  }
}






