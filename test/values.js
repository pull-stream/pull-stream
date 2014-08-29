

var pull = require('../')
var tape = require('tape')

tape('values - array', function (t) {
  pull(
    pull.values([1,2,3]),
    pull.collect(function (err, ary) {
      t.notOk(err)
      t.deepEqual(ary, [1, 2, 3])
      t.end()
    })
  )
})

tape('values - object', function (t) {
  pull(
    pull.values({a:1,b:2,c:3}),
    pull.collect(function (err, ary) {
      t.notOk(err)
      t.deepEqual(ary, [1, 2, 3])
      t.end()
    })
  )

})
