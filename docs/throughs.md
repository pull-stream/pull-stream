# Throughs

A Through is a stream that both reads and is read by
another stream.

Through streams are optional.

Put through streams in-between [sources](https://github.com/dominictarr/pull-stream/blob/master/docs/sources.md) and [sinks](https://github.com/dominictarr/pull-stream/blob/master/docs/sinks.md),
like this:

```js
source()
  .pipe(through()) //optional
  .pipe(sink())
```

Also, if you don't have the source/sink yet,
you can pipe multiple through streams together
to get one through stream!

```js
var throughABC = function () {
 return throughA()
    .pipe(throughB())
    .pipe(throughC())
}
```

Which can then be treated like a normal through stream!

```js
source().pipe(throughABC()).pipe(sink())
```

See also:
* [Sources](https://github.com/dominictarr/pull-stream/blob/master/docs/sources.md)
* [Sinks](https://github.com/dominictarr/pull-stream/blob/master/docs/sinks.md)

## map (fun)

Like `[].map(function (data) {return data})`

## asyncMap (fun)

Like `map` but the signature of `fun` must be
`function (data, cb) { cb(null, data) }`

## filter (test)

Like `[].filter(function (data) {return true || false})`
only `data` where `test(data) == true` are let through
to the next stream.


## filterNot (test)

Like filter, but remove items where the filter returns true.

## unique (prop)

Filter items that have a repeated value for `prop()`,
by default, `prop = function (it) {return it }`, if prop is a string,
it will filter nodes which have repeated values for that property.

## nonUnique (prop)

Filter unique items -- get the duplicates.
The inverse of `unique`

## take (test [, opts])

If test is a function, read data from the source stream and forward it downstream until test(data) returns false.

If `opts.last` is set to true, the data for which the test failed will be included in what is forwarded.

If test is an integer, take n item from the source.

## group (length)

Group incoming data into arrays of max length `length`,
(the last item may be shorter than `length`)

Useful for data you can handle in batches.

## flatten ()

Turn a stream of arrays into a stream of their items, (undoes group).

## highWaterMark (n)

An async buffering stream.

`highWaterMark` will eagerly read from the source stream,
while there are less than `n` chunks in the buffer.


