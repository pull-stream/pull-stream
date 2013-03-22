
var readArray = exports.readArray = function (array) {
  var i = 0
  return function (end, cb) {
    if(end)
      return cb && cb(end)
  
    cb(i >= array.length || null, array[i++])
  }
}

var count = function () {
  var i = 0
  return function (end, cb) {
    if(end) return cb && cb(end)
    cb(null, i++)
  }
}
