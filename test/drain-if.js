
var pull = require('../')
var test = require('tape')

test('reduce becomes through', function (t) {
  pull.values([1,2,3])
  .pipe(pull.reduce(function (a, b) {return a + b}, 0))
  .pipe(pull.through(console.log))
  .pipe(pull.collect(function (err, ary) {
    t.equal(ary[0], 6)
    t.end()
  }))
})


test('reduce becomes drain', function (t) {
  pull.values([1,2,3])
  .pipe(pull.reduce(function (a, b) {return a + b}, 0,
  function (err, acc) {
    t.equal(acc, 6)
    t.end()
  }))
})


