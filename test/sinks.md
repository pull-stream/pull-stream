
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

## writeArray(cb)

Read the stream into an array, then callback.

## onEnd (cb)

Drain the stream and then callback when done.

## drain (op?)

Drain the stream, calling `op` on each `data`.

## log

output the stream to `console.log`

