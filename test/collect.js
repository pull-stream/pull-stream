var pull = require('../')
var test = require('tape')

test('collect empty', function (t) {
  pull.empty().pipe(pull.collect(function (err, ary) {
    t.notOk(err)
    t.deepEqual(ary, [])
    t.end()
  }))
})
