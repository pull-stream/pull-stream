var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')
var u        = require('pull-core')

function isThrough (fun) {
  return fun.type === "Through" || fun.length === 1
}

var exports = module.exports = function pull () {
  var args = [].slice.call(arguments)

  if(isThrough(args[0]))
    return function (read) {
      args.unshift(read)
      return pull.apply(null, args)
    }

  var read = args.shift()
  while(args.length)
    read = args.shift() (read)
  return read
}

for(var k in sources)
  exports[k] = u.Source(sources[k])

for(var k in throughs)
  exports[k] = u.Through(throughs[k])

for(var k in sinks)
  exports[k] = u.Sink(sinks[k])

var maybe = require('./maybe')(exports)

for(var k in maybe)
  exports[k] = maybe[k]

exports.Duplex  = 
exports.Through = exports.pipeable       = u.Through
exports.Source  = exports.pipeableSource = u.Source
exports.Sink    = exports.pipeableSink   = u.Sink


