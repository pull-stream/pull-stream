var pull = require('../')
var tape =  require('tape')
tape('async-map', function (t) {

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

tape('abort async map', function (t) {
  var err = new Error('abort')
  t.plan(2)

  var read = pull(
    pull.infinite(),
    pull.asyncMap(function (data, cb) {
      setImmediate(function () {
        cb(null, data)
      })
    })
  )

  read(null, function (end) {
    if(!end) throw new Error('expected read to end')
    t.ok(end, "read's callback")
  })

  read(err, function (end) {
    if(!end) throw new Error('expected abort to end')
    t.ok(end, "Abort's callback")
    t.end()
  })

})

tape('abort async map (async source)', function (t) {
  var err = new Error('abort')
  t.plan(2)

  var read = pull(
    function(err, cb) {
      setImmediate(function() {
        if (err) return cb(err)
        cb(null, 'x')
      })
    },
    pull.asyncMap(function (data, cb) {
      setImmediate(function () {
        cb(null, data)
      })
    })
  )

  read(null, function (end) {
    if(!end) throw new Error('expected read to end')
    t.ok(end, "read's callback")
  })

  read(err, function (end) {
    if(!end) throw new Error('expected abort to end')
    t.ok(end, "Abort's callback")
    t.end()
  })

})
tape('asyncMap aborts when map errors', function (t) {
  t.plan(2)
  var ERR = new Error('abort')
  pull(
    pull.values([1,2,3], function (err) {
      console.log('on abort')
      t.equal(err, ERR, 'abort gets error')
      t.end()
    }),
    pull.asyncMap(function (data, cb) {
      cb(ERR)
    }),
    pull.collect(function (err) {
      t.equal(err, ERR, 'collect gets error')
    })
  )
})


