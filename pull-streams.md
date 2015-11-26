There are two fundamental types of streams `Source` and `Sink`. There are two composite types of streams `Through` (aka transform) and `Duplex`. A Through Stream is a sink stream that reads what goes into the Source Stream. A duplex stream is a pair of streams (`{Source, Sink}`) streams.

# Source Stream

A Source Stream (a readable stream) is an async function that may be called repeatedly until it returns a terminal state.
You _must not_ call the read function until the previous call has returned, except for a call to abort the stream.
pull-streams have back pressure, but it implicit instead of sending an explicit back pressure signal. If a source
needs the sink to slow down, it may simply delay returning a read. If a sink needs the source to slow down,
it just waits until it reads the source again.

## Read

A method, `read(null, cb(end|err))` read data from the stream. The stream may callback more data `cb(null, data)`. or it may terminate `cb(err|end)`.
read *must not* be called until the previous call has returned. read *must not* be called after it has terminated.
As a normal stream end is propagated up the pipeline, an error should be propagated also, because it also means the end of the stream.
If `cb(end=true)` that is a "end" which means it's a valid termination, if `cb(err)` that is an error.
`error` and `end` are mostly the same. If you are buffering inputs and see and `end`, process those inputs and then the end.
If you are buffering inputs and get an `error`, then you _may_ throw away that buffer and return the end.

## Abort
Sometimes it's the sink that errors, and if it can't read anymore then we _must_ abort the source. (example, source is a file stream from local fs, and sink is a http upload. prehaps the network drops or remote server crashes, in this case we should abort the source, so that it's resources can be released.)

To abort the sink, call read with a truthy first argument. You may abort a source _before_ it has returned from a regular read. (if you wait for the previous read to complete, it's possible you'd get a deadlock, if you a reading a stream that takes a long time, example, `tail -f` is reading a file, but nothing has appended to that file yet).

# Sink Stream

A Sink Stream (a writable stream) is a function that a Source Stream is passed to. The Sink Stream calls the `read` function of the Source Stream, abiding by the rules about when it may not call. 

## Abort
The Sink Stream may also abort the source if it can no longer read from it.

# Through Streams

A through stream is a sink stream that returns another source when it is passed a source.
A through stream may be thought of as wrapping a source.

# Duplex Streams

A pair of independent streams, one Source and one Sink. The purpose of a duplex stream is not transformation of the data that passes though it. It's meant for communication only.


# Composing Streams

since a sink is a function that takes a source, a source may be fed into a sink by simply passing the source to the sink.
`sink(source)`. since a transform is a sink that returns a source, you can just add to that pattern by wrapping the source.
`sink(transform(source))`.

This works, but it reads from right to left, and we are used to left to right.

## pull(...)

construct a pipeline of pull streams.

1. Connect a complete pipeline: `pull(source, transform,* sink)` this connects a source to a sink via zero or more transforms.

2. If a sink is not provided: `pull(source, transform+)` then pull should return the last `source`,
this way streams can be easily combined in a functional way.

3. If a source is not provided: `pull(transform,* sink)` then pull should return a sink that will complete the pipeline when
it's passed a source. `function (source) { return pull(source, pipeline) }`
If neither a source or a sink are provided, this will return a source that will return another source (via 2) i.e. a through stream.
