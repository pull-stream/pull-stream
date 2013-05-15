var tape       = require('tape')

var pstrm      = require('../')

var sources    = require('../sources')
var sinks      = require('../sinks')
var pull       = require('../')

var readArray  = sources.readArray

var pipeableSource = pstrm.pipeableSource
var pipeable       = pstrm.pipeable
var pipeableSink   = pstrm.pipeableSink

function arrayReader (read, cb) {
  var array = []
  read(null, function next (end, data) {
    
    if(end)
      return cb(end === true ? null : end, array)

    array.push(data)
    read(null, next)
  })
}

tape('basics', function (t) {
  var read = readArray([1, 2, 3])
  read(null, function (e, d) {
    t.ok(e == null, 'nullish')
    t.equal(d, 1)
    read(null, function (e, d) {
      t.ok(e == null, 'nullish')
      t.equal(d, 2)
      read(null, function (e, d) {
        t.ok(e == null, 'nullish')
        t.equal(d, 3)
        read(null, function (e, d) {
          t.equal(e, true)
          t.ok(d == null, 'nullish')
          t.end()
        })
      })
    })
  })
})

tape('readToArray', function (t) {
  var array = [1, 2, 3]
  var read = readArray(array)
  arrayReader(read, function (err, _array) {
    console.log('END?')
      t.deepEqual(_array, array)
      t.end()
    })
    //.pipe(...
    //(read)
})

tape('pipe', function (t) {
  var array = [1, 2, 3]
  var read = pipeableSource(readArray)(array)
  
  t.equal('function', typeof read)
  t.equal('function', typeof read.pipe)

  read.pipe(pipeableSink(arrayReader)(function (err, _array) {
    t.equal(err, null)
    t.deepEqual(_array, array)
    t.end()
  }))
})

tape('pipe2', function (t) {
  var array = [1, 2, 3]
  var read = pipeableSource(readArray)(array)
  arrayWriter = pull.writeArray

  t.equal('function', typeof read)
  t.equal('function', typeof read.pipe)

  read
    .pipe(function (read) {
      return function (end, cb) {
        read(end, function (end, data) {
          console.log(end, data)
          cb(end, data != null ? data * 2 : null)
        })
      }
    })
    .pipe(arrayWriter(function (err, _array) {
      console.log(_array)
      t.equal(err, null)
      t.deepEqual(_array, array.map(function (e) {
        return e * 2
      }))
      t.end()
    }))

})

