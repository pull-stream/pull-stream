var writeArray = exports.writeArray = function (read, cb) {
  var array = []
  read(null, function next (end, data) {
    if(end)
      return cb(end === true ? null : end, array)
    array.push(data)
    read(null, next)
  })
}

var onEnd = exports.onEnd = function (read, done) {
 return read(null, function next (err, data) {
    if(err) return done(err)
    read(null, next)
  })
}

var drain = exports.drain = function (read, op) {
  return read(null, function next (err, data) {
    if(err) return
    op && op(data)
    read(null, next)
  })
}

var log = exports.log = function (read) {
  return drain(read, console.log.bind(console))
}
