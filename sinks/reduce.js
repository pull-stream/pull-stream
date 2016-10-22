'use strict'

var drain = require('./drain')

module.exports = function reduce (/* reducer, acc, cb */) {
  var reducer = arguments[0]
  var acc
  var cb
  if (arguments.length === 3) {
    acc = arguments[1]
    cb = arguments[2]
    return drain(function (data) {
      acc = reducer(acc, data)
    }, function (err) {
      cb(err, acc)
    })
  } else {
    cb = arguments[1]
    var first = true
    return drain(function (data) {
      if (first) {
        acc = data
        first = false
      } else {
        acc = reducer(acc, data)
      }
    }, function (err) {
      cb(err, acc)
    })
  }
}

