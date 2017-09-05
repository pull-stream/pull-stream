'use strict'

var filter = require('./filter')

module.exports = function skip (test, lazy) {
  var pass = false

  if(typeof test === 'number') {
    var n = test
    test = function(){ return n-- > 0 }
  }

  return filter(function(data){
    if(pass) return true
    if(test(data)) return false

    pass = true

    return lazy !== true
  })
}
