
var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')
 
for(var k in sources)
  exports[k] = pipeableSource(sources[k])

for(var k in throughs)
  exports[k] = pipeable(throughs[k])

for(var k in sinks)
  exports[k] = pipeableSink(sinks[k])

exports.pipeableSource = pipeableSource
exports.pipeable       = pipeable
exports.pipeableSink = pipeableSink

function addPipe(read) {
  if('function' !== typeof read)
    return read

  read.pipe = read.pipe || function (reader) {
    if('function' != typeof reader)
      throw new Error('must pipe to reader')
    return addPipe(reader(read))
  }

  return read
}

function pipeableSource (createRead) {
  return function () {
    var args = [].slice.call(arguments)
    return addPipe(createRead.apply(null, args))
  }
}

function pipeable (createRead) {
  return function () {
    var args = [].slice.call(arguments)
    var piped = []
    function reader (read) {
      args.unshift(read)
      read = createRead.apply(null, args)
      while(piped.length)
        read = piped.shift()(read)
      return read
      //pipeing to from this reader should compose...
    }
    reader.pipe = function (read) {
      piped.push(read)
      return reader
    }
    return reader
  }
}

function pipeableSink(createReader) {
  return function () {
    var args = [].slice.call(arguments)
    return function (read) {
      args.unshift(read)
      return createReader.apply(null, args)
    }
  }
}

/*
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
*/
