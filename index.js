
var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')
 
for(var k in sources)
  exports[k] = Source(sources[k])

for(var k in throughs)
  exports[k] = Through(throughs[k])

for(var k in sinks)
  exports[k] = Sink(sinks[k])

exports.Duplex  = 
exports.Through = exports.pipeable       = Through
exports.Source  = exports.pipeableSource = Source
exports.Sink    = exports.pipeableSink   = Sink

exports.addPipe = addPipe
exports.addReaderPipe
                = addReaderPipe

function addPipe(read) {
  if('function' !== typeof read)
    return read

  read.pipe = read.pipe || function (reader) {
    if('function' != typeof reader)
      throw new Error('must pipe to reader')
    return addPipe(reader(read))
  }
  read.type = 'Source'
  console.log(read.type)
  return read
}

function Source (createRead) {
  function s() {
    var args = [].slice.call(arguments)
    return addPipe(createRead.apply(null, args))
  }
  s.type = 'Source'
  return s
}

function addReaderPipe(reader) {
  var piped = []
  function _reader (read) {
    read = reader(read)
    while(piped.length)
      read = piped.shift()(read)
    return read
    //pipeing to from this reader should compose...
  }
  _reader.pipe = function (read) {
    piped.push(read)
    return reader
  }
  return _reader
}

function Through (createRead) {
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
      if(read.type === 'Source')
        throw new Error('cannot pipe ' + reader.type + ' to Source')
      reader.type = read.type === 'Sink' ? 'Sink' : 'Through'
      return reader
    }
    reader.type = 'Through'
    return reader
  }
}

function Sink(createReader) {
  return function () {
    var args = [].slice.call(arguments)
    function s (read) {
      args.unshift(read)
      return createReader.apply(null, args)
    }
    s.type = 'Sink'
    return s
  }
}

