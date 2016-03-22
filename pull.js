module.exports = function pull (a) {
  if (typeof a === 'function' && a.length === 1) {
    var args = [].slice.call(arguments)
    return function (read) {
      args.unshift(read)
      return pull.apply(null, args)
    }
  }

  var read = a
  var n = arguments.length
  var i = 1

  if (read && typeof read.source === 'function') {
    read = read.source
  }

  for (; i < n; i++) {
    var s = arguments[i]
    if (typeof s === 'function') {
      read = s(read)
    } else if (s && typeof s === 'object') {
      s.sink(read)
      read = s.source
    }
  }

  return read
}

