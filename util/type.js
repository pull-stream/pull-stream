function abort (err, cb) { return cb(true) }

module.exports = function type (stream) {
  // Test if it is a through first.
  // If it is a sink, calling it will break.
  // So we wrap a try/catch
  try {
    if (typeof stream(abort) !== 'undefined') return 'through'
  } catch (e) {}

  // Test other streams, and otherwise null.
  if (stream.length === 1) return 'sink'
  else if (stream.length === 2) return 'source'
  else return null
}
