

var pull = require('../')
require('tape')('through - onEnd', function (t) {
  t.plan(2)
  var values = [1,2,3,4,5,6,7,8,9,10]

  //read values, and then just stop!
  //this is a subtle edge case for take!
  pull.Source(function () {
    return function (end, cb) {
      if(end) cb(end)
      else if(values.length)
        cb(null, values.shift())
      else console.log('drop')
    }
  })()
  .pipe(pull.take(10))
  .pipe(pull.through(null, function (err) {
    console.log('end')
    t.ok(true)
    process.nextTick(function () {
      t.end()
    })
  }))
  .pipe(pull.collect(function (err, ary) {
    console.log(ary)
    t.ok(true)
  }))

})

