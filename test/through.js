

var pull = require('../')
require('tape')('through - onEnd', function (t) {
  t.plan(2)
  pull.infinite()
  .pipe(pull.through(null, function (err) {
    console.log('end')
    t.ok(true)
    t.end()
  }))
  .pipe(pull.take(10))
  .pipe(pull.collect(function (err, ary) {
    console.log(ary)
    t.ok(true)
  }))

})
