var pull = require('..')

var tape = require('tape')

tape('abort on drain', function (t) {

  var c = 100
  var drain = pull.drain(function () {
    if(c < 0) throw new Error('stream should have aborted')
    if(!--c) return false //drain.abort()
  }, function () {
    t.end()
  })

  pull(pull.infinite(), drain)

})


function delay () {
  return pull.asyncMap(function (e, cb) {
    setTimeout(function () { cb(null, e) })
  })
}

tape('abort on drain - async', function (t) {

  var c = 100
  var drain = pull.drain(function () {
    if(c < 0) throw new Error('stream should have aborted')
    if(!--c) return drain.abort()
  }, function (err) {
    t.equal(err, null)
    t.end()
  })

  pull(pull.infinite(), delay(), drain)

})

tape('abort on drain - sync', function (t) {

  var c = 100
  var drain = pull.drain(function () {
    if(c < 0) throw new Error('stream should have aborted')
    if(!--c) return drain.abort()
  }, function (err) {
    t.equal(err, null)
    t.end()
  })

  pull(pull.infinite(), drain)

})


tape('abort on drain - async, out of cb', function (t) {

  var c = 0, ERR = new Error('test ABORT')
  var drain = pull.drain(function () {
    --c
  }, function (err) {
    t.ok(c < 0)
    t.equal(err, ERR)
    t.end()
  })

  pull(pull.infinite(), delay(), drain)

  setTimeout(function () {
    drain.abort(ERR)
  }, 100)

})


tape('abort while inside op', function (t) {

  var n = 0
  var drain
  pull(
    pull.values([1,2,3,4,5]),
    drain = pull.drain(function (n) {
      t.equal(n, 1)
      drain.abort(function (err) {
        t.notOk(err)
      })
    }, function (err) {
      t.equal(err, null)
      t.end()

    })
  )
})

tape('abort while inside op AND return false', function (t) {

  var n = 0
  var drain
  pull(
    pull.values([1,2,3,4,5]),
    drain = pull.drain(function (n) {
      t.equal(n, 1)
      drain.abort(function (err) {
        t.notOk(err)
      })
      return false
    }, function (err) {
      t.equal(err, null)
      t.end()

    })
  )
})

