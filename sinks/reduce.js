'use strict'

var drain = require('./drain')

module.exports = function reduce (/* reducer, acc, cb */) {
  var reducer = arguments[0]
  var acc
  var cb
  var sink = drain(function (data) {
    acc = reducer(acc, data)
  }, function (err) {
    cb(err, acc)
  })
  if (arguments.length === 2) {
    cb = arguments[2]
    return function (source) {
      source(null, function (end, data) {
        //if ended immediately, and no initial...
        if(end) return cb(end === true ? null : end)
        acc = data; sink(source)
      })
    }
  } else {
    acc = arguments[1]
    cb = arguments[2]
    return sink
  }
}
