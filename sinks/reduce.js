'use strict'

var drain = require('./drain')

module.exports = function reduce (reducer, acc, cb) {
  return drain(function (data) {
    acc = reducer(acc, data)
  }, function (err) {
    cb(err, acc)
  })
}

