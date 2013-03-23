# pull-stream

Experimental Minimal Pipeable Pull-stream

In [classic-streams](https://github.com/joyent/node/blob/v0.8/doc/api/stream.markdown),
streams _push_ data to the next stream in the pipeline.
In [new-streams](https://github.com/joyent/node/blob/v0.10/doc/api/stream.markdown),
data is pulled out of the source stream, into the destination.

`pull-stream` is an minimal take on pull streams.

## Examples

What if implementing a stream was this simple:

### Pipeable

``` js
var pipeable = require('pull-stream').pipeable

var createStream = pipeable(function (read) {
  return function (end, cb) {
    read(end, cb)
  }
})
```

### Readable & Reader vs. Readable & Writable

Instead of a readable stream, and a writable stream, there is a `readable` stream,
and a `reader` stream.

the readable stream is just a function, that may be called many times,
and will (asynchronously) callback.

if the user passes in `end`, then stop returning data.

``` js
var i = 100
var randomReadable = function () {
  return function (end, cb) {
    if(end) return cb(end)
    //only read 100 times
    if(i-- < 0) return cb(true)
    cb(null, Math.random())
  }
}
```

A `reader`, is just a function that calls a readable.
If you get an `end` stop reading.

``` js
var logger = function (read) {
    read(null, function next(end, data) {
      if(end === true) return
      if(end) throw err

      console.log(data)
      readable(end, next)
    })
  }
}
```

These can be connected together by passing the `readable` to the `reader`

``` js
logger(randomReadable())
```

Thats cool, but to be useful, we need transformation streams,
that do input _and_ output.

Simple!

### Duplex

``` js
var map = function (read, map) {
  //return a readable function!
  return function (end, cb) {
    read(end, function (end, data) {
      cb(end, data != null ? map(data) : null)
    })
  }
}
```

join them together!

### function composition style "pipe"

``` js
logger(
  map(randomReadable(), function (e) {
    return Math.round(e * 1000)
  }))
```

That is good -- but it's kinda weird,
because we are used to left to right syntax
for streams... `ls | grep | wc -l`

### pipeability

Every pipeline must go from a `source` to a `sink`.
Data will not start moving until the whole thing is connected.

``` js
source.pipe(through).pipe(sink)
```

When setting up pipeability, you must use the right
function, so `pipe` has the right behavior.

Use `pipeable`, `pipeableSource` and `pipeableSink`,
to add pipeability to your pull-streams.

#### Sources

``` js
//infinite stream of random noise
var pull = require('pull-stream')

var infinite = pull.pipeableSource(function () {
  return function (end, cb) {
    if(end) return cb(end)
    cb(null, Math.random())
  }
})

//create an instace like this

var infStream = infinite()
```

#### Throughs/Transforms

``` js
//map!
var pull = require('pull-stream')

var map = pull.pipeable(function (read, map) {
  return function (end, cb) {
    read(end, function (end, data) {
      if(end) return cb(end)
      cb(null, map(data))
    })
  }
})

//create an instance like this:

var mapStream = map(function (d) { return d * 100 })
```

### Sinks

``` js
var pull = require('pull-stream')

var log = pull.pipeableSink(function (read, done) {
  read(null, function next(end, data) {
    if(!end) {
      console.log(data)
      return setTimeout(function () {
        read(null, next)
      }, 200)
    }
    else //callback!
      done(end == true ? null : end)
  })
})
```

Now PIPE THEM TOGETHER!

``` js
infinite()
  .pipe(map(function (d) { return d * 100 }))
  .pipe(log())
```

JUST LIKE THAT!

## More Cool Stuff

What if you could do this?

``` js
var trippleThrough = 
  through1()
    .pipe(through2())
    .pipe(through3())
//THE THREE THROUGHS BECOME ONE

source()
  .pipe(trippleThrough)
  .pipe(sink())

//and then pipe it later!
```

## License

MIT
