# Throughs

A Through is a stream that both reads and is read by
another stream.

Through streams are optional.

Put through streams in-between sources and sinks,
like this:

``` js
source()
  .pipe(through()) //optional
  .pipe(sink())
```

Also, if you don't have the source/sink yet,
you can pipe multiple through streams together
to get one through stream!

``` js
var throughABC = function () {
 return throughA()
    .pipe(throughB())
    .pipe(throughC())
}
```

Which can then be treated like a normal through stream!

``` js
source().pipe(throughABC()).pipe(sink())
```

## map (fun)

like `[].map(function (data) {return data})`

## asyncMap (fun)

like `map` but the signature of `fun` must be
`function (data, cb) { cb(null, data) }`

## filter (test)

like `[].filter(function (data) {return true || false})`
only `data` where `test(data) == true` are let through
to the next stream.


## filterNot (test)

like filter, but remove items where the filter returns true.

## unique (prop)

Filter items that have a repeated value for `prop()`,
by default, `prop = function (it) {return it }`, if prop is a string,
it will filter nodes which have repeated values for that property.

## nonUnique (prop)

filter unique items -- get the duplicates.
The inverse of `unique`

## take (test)

read from the source stream until `test` fails.

## group (length)

Group incoming data into arrays of max length `length`,
(the last item may be shorter than `length`)

Useful for data you can handle in batches.

## flatten ()

Turn a stream of arrays into a stream of their items, (undoes group).

## highWaterMark (n)

A async buffering stream.

`highWaterMark` will eagerly read from the source stream,
while there are less than `n` chunks in the buffer.


