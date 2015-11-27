# Sources

A source is a stream that is not writable.
You *must* have a source at the start of a pipeline
for data to move through.

in general:

``` js
pull(source, through, sink)
```

See also:
* [Throughs](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md)
* [Sinks](https://github.com/dominictarr/pull-stream/blob/master/docs/sinks.md)

## values (array | object)

create a SourceStream that reads the values from an array or object and then stops.

## keys (array | object)

stream the key names from an object (or array)

## count (max)

create a stream that outputs `0 ... max`.
by default, `max = Infinity`, see
[take](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md#take_test)

## infinite (generator)

create an unending stream by repeatedly calling a generator
function (by default, `Math.random`)
see
[take](https://github.com/dominictarr/pull-stream/blob/master/docs/throughs.md#take_test)

## empty

A stream with no contents (it just ends immediately)

``` js
pull.empty().pipe(pull.collect(function (err, ary) {
  console.log(arg)
  // ==> []
})
```

