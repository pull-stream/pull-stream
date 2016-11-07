function abort (err, cb) { return cb(true) }

module.exports = function type (stream) {
  // Test if it is a through first.
  // If a source, calling it like this will break.
  // So we wrap a try/catch:
  try {
    var source = stream(abort)
    if (typeof source === 'function' && source.length === 2) return 'through'
  } catch (e) {}

  // Test other streams, and otherwise null.
  if (stream.length === 1) return 'sink'
  else if (stream.length === 2) return 'source'
  else return null
}
