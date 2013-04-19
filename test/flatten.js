var pull = require('../')
var test = require('tape')

test('flatten arrays', function (t) {

  pull.values([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ])
  .pipe(pull.flatten())
  .pipe(pull.collect(function (err, numbers) {
    t.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9], numbers)
    t.end()
  }))

})

test('flatten stream of streams', function (t) {

  pull.values([
    pull.values([1, 2, 3]),
    pull.values([4, 5, 6]),
    pull.values([7, 8, 9])
  ])
  .pipe(pull.flatten())
  .pipe(pull.collect(function (err, numbers) {
    t.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9], numbers)
    t.end()
  }))

})


