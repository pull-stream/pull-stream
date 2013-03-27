var pull = require('../')

require('tape')('group', function (t) {
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
  .pipe(pull.drain(function () {
    t.end()
  }))
})
