var pull = require('../')
var path = require('path')
var fs   = require('fs')
var test = require('tape')

var start = path.resolve(__dirname, '..')

function ls_r (start, type) {
  type = type || pull.depthFirst
  return type(start, function (dir) {
    var def = pull.defer()
    fs.readdir(dir, function (err, ls) {
      if(err)
        return def.abort(err.code === 'ENOTDIR' ? true : err)

      def.resolve(
        pull.values(ls || [])
        .pipe(pull.map(function (file) {
          return path.resolve(dir, file)
        }))
      )
    })

    return def
  })
}

test('widthFirst', function (t) {
  var max = 0, didStart

  pull(
    ls_r(start, pull.widthFirst),
    pull.map(function (file) {
      if(file === start) didStart = true
      return file.split('/').length
    }),
    pull.filter(function (d) {
      t.ok(d >= max)
      if(d > max)
        return max = d, true
    }),
    pull.through(console.log),
    pull.drain(null, function () {
      t.ok(didStart)
      t.end()
    })
  )
})

test('depthFirst', function (t) {
  var seen = {}
  //assert that for each item,
  //you have seen the dir already
  pull(
    ls_r(start, pull.depthFirst),
    pull.through(function (file) {
      if(file != start) {
        var dir = path.dirname(file)
        t.ok(seen[dir])
      }
      //console.log(dir)
      seen[file] = true
    }),
    pull.onEnd(function () {
      t.end()
    })
  )

})

test('leafFirst', function (t) {
  var seen = {}
  var expected = {}
    expected[start] = true
  //assert that for each item,
  //you have seen the dir already
  ls_r(start, pull.leafFirst)
    .pipe(pull.through(function (file) {
      if(file !== start) {
        var dir = path.dirname(file)
        t.ok(!seen[dir])
        expected[dir] = true
      }
      if(expected[file])
        delete expected[file]
    }))
    .pipe(pull.drain(null, function () {
      for(var k in expected)
        t.ok(false, k)
      t.end()
    }))

})


