var pull = require('../')

require('tape')('async-map', function (t) {

  pull.count()
  .pipe(pull.take(21))
  .pipe(pull.asyncMap(function (data, cb) {
    return cb(null, data + 1)
  }))
  .pipe(pull.collect(function (err, ary) {
    console.log(ary)
    t.equal(ary.length, 21)
    t.end()
  }))

})
