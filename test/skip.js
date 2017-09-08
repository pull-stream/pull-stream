var pull = require('../')
var test = require('tape')

test('skip - include first (default)', function (t) {
  pull(
    pull.values([1,2,3,4,5,6,7,8,9,10]),
    pull.skip(function(n) {return n<5}),
    pull.collect(function (err, four) {
      t.deepEqual(four, [5,6,7,8,9,10])
      t.end()
    })
  )
})
test('skip - exclude first', function (t) {
  pull(
    pull.values([1,2,3,4,5,6,7,8,9,10]),
    pull.skip(function(n) {return n<5}, true),
    pull.collect(function (err, four) {
      t.deepEqual(four, [6,7,8,9,10])
      t.end()
    })
  )
})
test('skip - N items', function (t) {
  pull(
    pull.values([1,2,3,4,5,6,7,8,9,10]),
    pull.skip(7),
    pull.collect(function (err, four) {
      t.deepEqual(four, [8,9,10])
      t.end()
    })
  )
})
test('skip - N items, exclude first', function (t) {
  pull(
    pull.values([1,2,3,4,5,6,7,8,9,10]),
    pull.skip(7, true),
    pull.collect(function (err, four) {
      t.deepEqual(four, [9,10])
      t.end()
    })
  )
})
