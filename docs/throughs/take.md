# pull-stream/throughs/take

## usage

### `take = require('pull-stream/throughs/take')`

### `take(test [, opts])`

If test is a function, read data from the source stream and forward it downstream until test(data) returns false.

If `opts.last` is set to true, the data for which the test failed will be included in what is forwarded.

If test is an integer, take n item from the source.
