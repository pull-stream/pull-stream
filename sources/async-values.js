'use strict'
var abortCb = require('../util/abort-cb')

module.exports = function asyncValues (generator, onAbort) {
  var i = 0
  var array
  return function self (abort, cb) {
    if(abort) return abortCb(cb, abort, onAbort)
    else if(!array) {
      generator(function (err, yielded) {
        if(err) return cb(err)
        else {
          array = Array.isArray(yielded)
            ? yielded
            : Object.keys(yielded).map(function (k) {
              return yielded[k]
            })
          self(abort, cb)
        }
      })
    } else if(i >= array.length) cb(true)
    else cb(null, array[i++])
  }
}
