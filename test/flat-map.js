
var pull = require('../')

var tape = require('tape')


tape('flat-map', function (t) {

  pull(
    pull.count(6),
    pull.flatMap(function (n) {
      var a = [n]
      //extract all factors of two
      while(n && !(n&1)) {
        n = n >> 1
        a.push(n)
      }
      return a
    }),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary,[0,1,2,1,3,4,2,1,5,6,3])
      t.end()
    })
  )

})

tape('unpack', function (t) {

  pull(
    pull.values([
      [1,2,3],
      [],
      [],
      [4,5,6],
      []
    ]),
    pull.flatMap(),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [1,2,3,4,5,6])
      t.end()
    })
  )
})
