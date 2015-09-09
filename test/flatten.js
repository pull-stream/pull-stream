var pull = require('../')
var test = require('tape')

test('flatten arrays', function (t) {
  pull(
    pull.values([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]),
    pull.flatten(),
    pull.collect(function (err, numbers) {
      t.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9], numbers)
      t.end()
    })
  )
})

test('flatten - number of reads', function (t) {
  var reads = 0
  pull(
    pull.values([
      pull.values([1, 2, 3]),
    ]),
    pull.flatten(),
    pull.through(function() {
      reads++
      console.log('READ', reads)
    }),
    pull.take(2),
    pull.collect(function (err, numbers) {
      t.deepEqual([1, 2], numbers)
      t.equal(reads, 2)
      t.end()
    })
  )

})
test('flatten stream of streams', function (t) {

  pull(
    pull.values([
      pull.values([1, 2, 3]),
      pull.values([4, 5, 6]),
      pull.values([7, 8, 9])
    ]),
    pull.flatten(),
    pull.collect(function (err, numbers) {
      t.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9], numbers)
      t.end()
    })
  )

})

test('flatten stream of broken streams', function (t) {
  var _err = new Error('I am broken');
  pull(
    pull.values([
      pull.Source(function read(abort, cb) {
          cb(_err)  
        })
    ]),
    pull.flatten(),
    pull.onEnd(function (err) {
      t.equal(err, _err)
      t.end()
    })
  )

})

