var pull = require('../')

require('tape')('async-map', function (t) {

//  pull.count()
//  .pipe(pull.take(21))
//  .pipe(pull.asyncMap(function (data, cb) {
//    return cb(null, data + 1)
//  }))
//  .pipe(pull.collect(function (err, ary) {
//    console.log(ary)
//    t.equal(ary.length, 21)
//    t.end()
//  }))

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

require('tape')('para-map', function (t) {

  var n = 0, m = 0, w = 6, i = 0
  pull(
    pull.count(),
    pull.take(21),
    pull.paraMap(function (data, cb) {
      console.log('>', i++)
      n ++
      m = Math.max(m, n)
      setTimeout(function () {
        n --

        console.log('<')
        cb(null, data + 1)
      }, Math.random() * 20)
    }, w),
    pull.collect(function (err, ary) {
      console.log(ary)
      t.equal(ary.length, 21)
      t.equal(m, w)
      t.end()
    })
  )

})


