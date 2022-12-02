# pull-stream/sinks/collect-as-promise

## usage

### `collectAsPromise = require('pull-stream/sinks/collect-as-promise')`

### `collectAsPromise()`

Read the stream into an array, then deliver the array in a promise.

```js
const ary = await pull(
  pull.values([10, 20, 30]),
  pull.collectAsPromise()
)

console.log(arg)
// ==> [10, 20, 30]
```
