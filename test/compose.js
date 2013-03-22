var pull = require('../')
var test  = require('tape')
//test through streams compose on pipe!

test('join through streams with pipe', function (t) {

  var map = pull.map

  var pipeline = 
    map(function (d) {
      //make exciting!
      return d + '!'
    })
    .pipe(map(function (d) {
      //make loud
      return d.toUpperCase()
    }))
    .pipe(map(function (d) {
      //add sparkles
      return '*** ' + d + ' ***'
    }))
  //the pipe line does not have a source stream.
  //so it should be a reader (function that accepts
  //a read function)

  t.equal('function', typeof pipeline)
  t.equal(1, pipeline.length)

  //if we pipe a read function to the pipeline,
  //the pipeline will become readable!

  var read = 
    pull.readArray(['billy', 'joe', 'zeke'])
    .pipe(pipeline)

  t.equal('function', typeof read)
  //we will know it's a read function,
  //because read takes two args.
  t.equal(2, read.length)

  read
    .pipe(pull.writeArray(function (err, array) {
      console.log(array)
      t.deepEqual(
        array, 
        [ '*** BILLY! ***', '*** JOE! ***', '*** ZEKE! ***' ]
      )
      t.end()
    }))

})
