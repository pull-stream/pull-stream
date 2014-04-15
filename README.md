# pull-stream

Minimal Pipeable Pull-stream

In [classic-streams](https://github.com/joyent/node/blob/v0.8/doc/api/stream.markdown),
streams _push_ data to the next stream in the pipeline.
In [new-streams](https://github.com/joyent/node/blob/v0.10/doc/api/stream.markdown),
data is pulled out of the source stream, into the destination.

`pull-stream` is a minimal take on pull streams,
optimized for "object" streams, but still supporting text streams.

## Quick Example

Stat some files:

```js
pull(
  pull.values(['file1', 'file2', 'file3']),
  pull.asyncMap(fs.stat),
  pull.collect(function (err, array) {
    console.log(array)
  })
)
```
note that `pull(a, b, c)` is basically the same as `a.pipe(b).pipe(c)`.

The best thing about pull-stream is that it can be completely lazy.
This is perfect for async traversals where you might want to stop early.

## Examples

What if implementing a stream was this simple:

### Pipeable Streams

`pull.{Source,Through,Sink}` just wrap a function and give it a `.pipe(dest)`!

```js
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

pull(createSourceStream(), createThroughStream()), createSinkStream())
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

```js
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

```js
var logger = pull.Sink(function (read) {
  read(null, function next(end, data) {
    if(end === true) return
    if(end) throw end

    console.log(data)
    read(null, next)
  })
})
```

These can be connected together by passing the `readable` to the `reader`

```js
logger()(randomReadable())
```

Or, if you prefer to read things left-to-right

```js
pull(randomReadable(), logger())
```

### Through / Duplex

A duplex/through stream is both a `reader` that is also `readable`

A duplex/through stream is just a function that takes a `read` function,
and returns another `read` function.

```js
var map = pull.Through(function (read, map) {
  //return a readable function!
  return function (end, cb) {
    read(end, function (end, data) {
      cb(end, data != null ? map(data) : null)
    })
  }
})
```

### Pipeability

Every pipeline must go from a `source` to a `sink`.
Data will not start moving until the whole thing is connected.

```js
pull(source, through, sink)
```

some times, it's simplest to describe a stream in terms of other streams.
pull can detect what sort of stream it starts with (by counting arguments)
and if you pull together through streams, it gives you a new through stream.

```js
var tripleThrough =
  pull(through1(), through2(), through3())
//THE THREE THROUGHS BECOME ONE

pull(source(), tripleThrough, sink())
```

## Duplex Streams

Duplex streams, which are used to communicate between two things,
(i.e. over a network) are a little different. In a duplex stream,
messages go both ways, so instead of a single function that represents the stream,
you need a pair of streams. `{source: sourceStream, sink: sinkStream}`

pipe duplex streams like this:

``` js
var a = duplex()
var b = duplex()

pull(a.source, b.sink)
pull(b.source, a.sink)

//which is the same as

b.sink(a.source); a.sink(b.source)

//but the easiest way is to allow pull to handle this

pull(a, b, a)

//"pull from a to b and then back to a"

```

## Design Goals & Rationale

There is a deeper,
[platonic abstraction](http://en.wikipedia.org/wiki/Platonic_idealism),
where a streams is just an array in time, instead of in space.
And all the various streaming "abstractions" are just crude implementations
of this abstract idea.

[classic-streams](https://github.com/joyent/node/blob/v0.8.16/doc/api/stream.markdown),
[new-streams](https://github.com/joyent/node/blob/v0.10/doc/api/stream.markdown),
[reducers](https://github.com/Gozala/reducers)

The objective here is to find a simple realization of the best features of the above.

### Type Agnostic

A stream abstraction should be able to handle both streams of text and streams
of objects.

### A pipeline is also a stream.

Something like this should work: `a.pipe(x.pipe(y).pipe(z)).pipe(b)`
this makes it possible to write a custom stream simply by
combining a few available streams.

### Propagate End/Error conditions.

If a stream ends in an unexpected way (error),
then other streams in the pipeline should be notified.
(this is a problem in node streams - when an error occurs,
the stream is disconnected, and the user must handle that specially)

Also, the stream should be able to be ended from either end.

### Transparent Backpressure & Laziness

Very simple transform streams must be able to transfer back pressure
instantly.

This is a problem in node streams, pause is only transfered on write, so
on a long chain (`a.pipe(b).pipe(c)`), if `c` pauses, `b` will have to write to it
to pause, and then `a` will have to write to `b` to pause.
If `b` only transforms `a`'s output, then `a` will have to write to `b` twice to
find out that `c` is paused.

[reducers](https://github.com/Gozala/reducers) reducers has an interesting method,
where synchronous tranformations propagate back pressure instantly!

This means you can have two "smart" streams doing io at the ends, and lots of dumb
streams in the middle, and back pressure will work perfectly, as if the dumb streams
are not there.

This makes laziness work right.

## License

MIT
