

var pull = require('../')

pull.values([1, 2, 3])
.pipe(pull.prepend(0))
.pipe(pull.collect(function (err, ary) {
  console.log(ary)
}))
