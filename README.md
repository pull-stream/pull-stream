# pull-stream

Experimental Minimal Pipeable Pull-stream

In [classic-streams](https://github.com/joyent/node/blob/v0.8/doc/api/stream.markdown),
streams _push_ data to the next stream in the pipeline.
In [new-streams](https://github.com/joyent/node/blob/v0.8/doc/api/stream.markdown),
data is pulled out of the source stream, into the destination.

`pull-stream` is an minimal take on pull streams.

Instead of a readable stream, and a writable stream, there is a `readable` stream,
and a `reader` stream.

the readable stream is just a function, that may be called many times,
and will (asynchronously) callback.

if the user passes in `end`, then stop returning data.

``` js
var i = 100
var randomReadable = function (end, cb) {
  if(end) return cb(end)
  //only read 100 times
  if(i-- < 0) return cb(true)
  cb(null, Math.random())
}
```

A `reader`, is just a function that calls a readable.
If you get an `end` stop reading.

``` js
var logger = function (readable) {
  readable(null, function next(end, data) {
    if(end === true) return
    if(end) throw err

    console.log(data)
    readable(err, next)
  })
}
```

These can be connected together by passing the `readable` to the `reader`

``` js
logger(randomReadable)
```

Thats cool, but to be useful, we need transformation streams,
that do input _and_ output.

Simple!

``` js
var map = function (readable, map) {
  //return a readable function!
  return function (end, cb) {
    readable(end, function (end, data) {
      cb(end, data != null ? map(data) : null)
    })
  }
}
```

join them together!

``` js
logger(
  map(randomReadable, function (e) {
    return Math.round(e * 1000)
  }))
```

That is good -- but it's kinda weird, because we are used to left to right syntax
for streams... `ls | grep | wc -l`

So, we want to pass in the `readable` and `reader` function!
It needs to be that order, so that it reads left to right.

A basic duplex function would look like this:

``` js
var i = 100
var multiply = function (readable) {
  return function (reader) {
    return reader(function (end, cb) {
      //insert your own code in here!
      readable(end, function (end, data) {
        cb(end,  Math.round(data * 1000))
      })
    })
  }
}
``` 

A stream that is only readable is simpler:
``` js
var randomReadable2 = function (reader) {
  return reader(function (end, cb) {
    cb(end, 'hello!')
  })
}
```

and a "sink" stream, that can only read, is the same as before!

``` js
var reader = function (readable) {
  readable(null, function (end, data) {
    if(end === true) return
    if(end) throw end
    readable(end, data)
  })
}
```

The `reader` stream is the same as before!

Now PIPE THEM TOGETHER!

``` js
randomReader2 (multiply) (logger)
```

JUST LIKE THAT!

## License

MIT
