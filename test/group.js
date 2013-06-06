var pull = require('../')
var test = require('tape')

process.on('uncaughtException', function (err) {
  console.error(err.stack)
})

test('group', function (t) {
  pull.count()
  .pipe(pull.take(20))
  .pipe(pull.group(7))
  .pipe(pull.group(3))
  .pipe(function (read) {
    return function (end, cb) {
      read(null, function (end, data) {
        if(!end) {
          t.deepEqual(data, [
            [0, 1,2,3,4,5,6],
            [7,8,9,10,11,12,13],
            [14, 15,16,17,18,19]
          ])
          console.log(data)
        }
       
       process.nextTick(cb.bind(null, end, data))
      })
    }
  })
  .pipe(pull.drain(null, function (err) {
    t.notOk(err)
    t.end()
  }))
})

test('flatten (ungroup)', function (t) {
  pull.count()
  .pipe(pull.take(20))
  .pipe(pull.group(7))
  .pipe(pull.group(3))
  .pipe(pull.through(console.log))
  .pipe(pull.flatten())
  .pipe(pull.through(console.log))
  .pipe(pull.flatten())
  .pipe(pull.collect(function (err, ary) {
    t.notOk(err)
    console.log(ary)
    t.deepEqual(ary, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
    t.end()
  }))
})

