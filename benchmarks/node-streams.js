const bench = require('fastbench')
const pull = require('../')

const values = [
  JSON.stringify({ hello: 'world' }),
  JSON.stringify({ foo: 'bar' }),
  JSON.stringify({ bin: 'baz' })
]

const run = bench([
  function readPipeline (done) {
    const source = pull.values(values)
    const through = pull.asyncMap(function (val, done) {
      const json = JSON.parse(val)
      done(null, json)
    })

    const sink = pull.collect(function (err, array) {
      if (err) return console.error(err)
      setImmediate(done)
    })
    pull(source, through, sink)
  }
], 10000)

run()
