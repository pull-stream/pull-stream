var pull = require('../')
var test = require('tape')

test('Source', function (t) {
  var n = pull.values([])
  t.equal(n.type, 'Source')
  t.end()
})

test('Through', function (t) {
  var n = pull.map(function () {})
  t.equal(n.type, 'Through')
  t.end()
})

test('Sink', function (t) {
  var n = pull.drain()
  t.equal(n.type, 'Sink')
  t.end()
})

test('Through.pipe(Through) -> Through', function (t) {
  var n = pull.map().pipe(pull.filter())
  t.equal(n.type, 'Through')
  t.end()
})

test('Through.pipe(Sink) -> Sink', function (t) {
  var n = pull.map().pipe(pull.drain())
  t.equal(n.type, 'Sink')
  t.end()
})

test('Source.pipe(Through) -> Source', function (t) {
  var n = pull.values([]).pipe(pull.map())
  t.equal(n.type, 'Source')
  t.end()
})

test('Source.pipe(Source) -> throw Error', function (t) {
  t.throws(function () {
    pull.values([]).pipe(pull.values())
  })
  t.end()
})

test('Through.pipe(Source) -> throw Error', function (t) {
  t.throws(function () {
    pull.map().pipe(pull.values())
  })
  t.end()
})

test('Source.pipe(Sink) -> undefined', function (t) {
  t.equal(pull.values([]).pipe(pull.drain()), undefined)
  t.end()
})

test('maybe(cb) -> Sink', function (t) {
  var n = pull.collect(function (){})
  console.log('Sink?', n)
  t.equal(n.type, 'Sink')
  t.end()
})

test('maybe(cb) -> Through', function (t) {
  console.error('***********')
  var n = pull.collect()
  console.error('Through?', n)
  t.equal(n.type, 'Through')
  t.end()
})


