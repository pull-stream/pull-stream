

var pull = require('../')
pull(
  pull.values([1, 2, 3]),
  pull.prepend(0),
  pull.collect(function (err, ary) {
    console.log(ary)
  })
)
