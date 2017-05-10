var pull = require('../pull')
var values = require('../sources/values')
var map = require('../throughs/map')
var error = require('../sources/error')
var test = require('tape')

test('continuable stream', function (t) {
  t.plan(3)

  var contSink = function (read) {
    return function (cb) {
      read(null, function (err, data) {
        if (err) return cb(err)

        // Simulate some async sink task:
        setTimeout(function () {
          cb(null)
        }, 250)
      })
    }
  }

  var contSinkError = function (read) {
    return function (cb) {
      read(null, function (err, data) {
        if (err) return cb(err)
        else return cb(null)
      })
    }
  }

  var continuable = pull(
    values([1, 2, 3, 4, 5]),
    map(function (item) {
      return item * 2
    }),
    contSink
  )

  t.is(typeof continuable, 'function', 'returns function')
  continuable(function (err) {
    t.is(err, null, 'has no error')
    t.end()
  })

  var errContinuable = pull(
    error(new Error('test error')),
    contSinkError
  )

  errContinuable(function (err) {
    t.is(err.message, 'test error', 'has error')
  })
})
