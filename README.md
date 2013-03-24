# pull-stream

Experimental Minimal Pipeable Pull-stream

In [classic-streams](https://github.com/joyent/node/blob/v0.8/doc/api/stream.markdown),
streams _push_ data to the next stream in the pipeline.
In [new-streams](https://github.com/joyent/node/blob/v0.10/doc/api/stream.markdown),
data is pulled out of the source stream, into the destination.

`pull-stream` is a minimal take on pull streams.

## Examples

What if implementing a stream was this simple:

### Pipeable Streams

`pull.{Source,Through,Sink}` just wrap a function and give it a `.pipe(dest)`!

``` js
var pull = require('pull-stream')

var createSourceStream = pull.Source(function () {
  return function (end, cb) {
    return cb(end, Math.random())
  }
})

var createThroughStream = pull.Through(function (read) {
  return function (end, cb) {
    read(end, cb)
  }
})

var createSinkStream = pull.Sink(function (read) {
  read(null, function next (end, data) {
    if(end) return
    console.log(data)
    read(null, next)
  })
})

createSourceStream().pipe(createThroughStream()).pipe(createSinkStream())
```

### Readable & Reader vs. Readable & Writable

Instead of a readable stream, and a writable stream, there is a `readable` stream,
and a `reader` stream.

See also:
* [Sources](https://github.com/dominictarr/pull-stream/blob/master/docs/sources.md)
* [Throughs](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md)
* [Sinks](https://github.com/dominictarr/pull-stream/blob/master/docs/sinks.md)

### Readable

The readable stream is just a `function(end, cb)`,
that may be called many times,
and will (asynchronously) `callback(null, data)` once for each call.

The readable stream eventually `callback(err)` if there was an error, or `callback(true)`
if the stream has no more data.

if the user passes in `end = true`, then stop getting data from wherever.

All [Sources](https://github.com/dominictarr/pull-stream/blob/master/docs/sources.md)
and [Throughs](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md)
are readable streams.

``` js
var i = 100
var randomReadable = pull.Source(function () {
  return function (end, cb) {
    if(end) return cb(end)
    //only read 100 times
    if(i-- < 0) return cb(true)
    cb(null, Math.random())
  }
})
```

### Reader (aka, "writable")

A `reader`, is just a function that calls a readable,
until it decideds to stop, or the readable `cb(err || true)`

All [Throughs](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md)
and [Sinks](https://github.com/dominictarr/pull-stream/blob/master/docs/sinks.md)
are reader streams.

``` js
var logger = pull.Sink(function (read) {
  read(null, function next(end, data) {
    if(end === true) return
    if(end) throw err

    console.log(data)
    readable(end, next)
  })
})
```

These can be connected together by passing the `readable` to the `reader`

``` js
logger()(randomReadable())
```

Or, if you prefer to read things left-to-right

``` js
randomReadable().pipe(logger())
```

### Through / Duplex

A duplex/through stream is both a `reader` that is also `readable`

A duplex/through stream is just a function that takes a `read` function,
and returns another `read` function.

``` js
var map = pull.Through(function (read, map) {
  //return a readable function!
  return function (end, cb) {
    read(end, function (end, data) {
      cb(end, data != null ? map(data) : null)
    })
  }
})
```

### pipeability

Every pipeline must go from a `source` to a `sink`.
Data will not start moving until the whole thing is connected.

``` js
source.pipe(through).pipe(sink)
```

When setting up pipeability, you must use the right
function, so `pipe` has the right behavior.

Use `Source`, `Through` and `Sink`,
to add pipeability to your pull-streams.

## More Cool Stuff

What if you could do this?

``` js
var trippleThrough = 
  through1().pipe(through2()).pipe(through3())
//THE THREE THROUGHS BECOME ONE

source().pipe(trippleThrough).pipe(sink())

//and then pipe it later!
```

## License

MIT
