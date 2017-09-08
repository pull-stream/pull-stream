# pull-stream/throughs/skip

## usage

### `skip = require('pull-stream/throughs/skip')`

### `skip(test [, lazy])`

If `test` is a function, skip data from the source stream until `test(data)` returns `false`.

If `lazy` is set to true, the data for which the test failed is not forwarded.

If `test` is an integer, skip `n` items from the source.
