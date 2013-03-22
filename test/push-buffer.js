
var pull = require('../')
var test = require('tape')

test('push-buffer', function (t) {

  var buf = pull.PushBuffer()

  //should be a read function!

  t.equal('function', typeof buf)
  t.equal(2, buf.length)

  buf.pipe(pull.writeArray(function (end, array) {
    console.log(array)
    t.deepEqual(array, [1, 2, 3])
    t.end()
  }))

  //SOMETIMES YOU NEED PUSH!

  buf.push(1)
  buf.push(2)
  buf.push(3)
  buf.end()

})
