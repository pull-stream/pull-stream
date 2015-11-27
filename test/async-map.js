var pull = require('../')

require('tape')('async-map', function (t) {

  pull(
    pull.count(),
    pull.take(21),
    pull.asyncMap(function (data, cb) {
      return cb(null, data + 1)
    }),
    pull.collect(function (err, ary) {
      console.log(ary)
      t.equal(ary.length, 21)
      t.end()
    })
  )


})


