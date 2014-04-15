# Sources

A source is a stream that is not writable.
You *must* have a source at the start of a pipeline
for data to move through.

in general:

``` js
source()
  .pipe(through()) //optional
  .pipe(sink())
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

## defer

create a false source-stream that will be attached to a 
real source-stream later. Use when you must do an async
operation before you can create the stream.


``` js
function ls (dir) {
  var ds = pull.defer()
  fs.readdir(dir, function (err, ls) {
    if(err) return ds.abort(err)
    return ds.resolve(readArray(ls)
      .pipe(pull.map(function (file) {
        return path.resolve(dir, file)
      })
  })
  return ds
}
```

## empty

A stream with no contents (it just ends immediately)

``` js
pull.empty().pipe(pull.collect(function (err, ary) {
  console.log(arg)
  // ==> []
})
```

## pushable

Create a false source stream with a `.push(data, cb?)`
property. Use when you really need a push api,
or need to adapt pull-stream to some other push api.

``` js
function ls (dir) {
  var ps = pull.pushable()
  fs.readdir(dir, function (err, ls) {
    if(err) return ps.end(err)
    ls.forEach(function (file) {
      ps.push(path.resolve(dir, file))
    })
    ps.end()
  })
  return ps
}
```

## depthFirst, widthFirst, leafFirst (start, createStream)

Traverse a tree structure. `start` is a value that represents
a node. `createStream` is a function that returns
a pull-stream of the children of a node.
`start` must be the same type output by `createStream`.

``` js
//passing in the `ls` function from the `defer` example.
pull.widthFirst(process.cwd(), ls)
  .pipe(pull.log())
```

