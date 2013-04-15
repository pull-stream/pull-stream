
# Sinks

A Source is a stream that is not readable.
You *must* have a source at the start of a pipeline
for data to move through.

You can only use _one_ sink per pipeline.

``` js
source()
  .pipe(through()) //optional
  .pipe(sink())
```

## drain (op?, done?)

Drain the stream, calling `op` on each `data`.
call `done` when stream is finished.
If op returns `===false`, abort the stream.

## reduce (reduce, initial, cb)

reduce stream into single value, then callback.

## collect(cb)

Read the stream into an array, then callback.

## onEnd (cb)

Drain the stream and then callback when done.

## log

output the stream to `console.log`

