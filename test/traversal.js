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
        pull.readArray(ls || [])
        .pipe(pull.map(function (file) {
          return path.resolve(dir, file)
        }))
      )
    })

    return def
  })
  //.pipe(pull.filter(function (e) {return !/\/\./.test(e)} ))
  /*.pipe(pull.map(function (d) {
    return path.relative(start, d)
  }))*/

}

test('widthFirst', function (t) {
  var max = 0
  ls_r(start, pull.widthFirst)
    .pipe(pull.map(function (file) {
      return file.split('/').length
    }))
    .pipe(pull.filter(function (d) {
      t.ok(d >= max)
      if(d > max)
        return max = d, true
    }))
    .pipe(pull.through(console.log))
    .pipe(pull.onEnd(function () {
       t.end()
    }))
})

test('depthFirst', function (t) {
  var seen = {}
  seen[start] = true
  //assert that for each item,
  //you have seen the dir already
  ls_r(start, pull.depthFirst)
    .pipe(pull.through(function (file) {
      var dir = path.dirname(file)
      t.ok(seen[dir])
      seen[file] = true
    }))
    .pipe(pull.onEnd(function () {
      t.end()
    }))

})

test('leafFirst', function (t) {
  var seen = {}
  var expected = {}
//  expected[start] = true
  //assert that for each item,
  //you have seen the dir already
  ls_r(start, pull.leafFirst)
    .pipe(pull.through(function (file) {
      if(!file) return
      var dir = path.dirname(file)
      t.ok(!seen[dir])
      expected[dir] = true
      if(expected[file])
        delete expected[file]
    }))
    .pipe(pull.onEnd(function () {
      delete expected[start]
      for(var k in expected)
        t.ok(false, k)
      t.end()
    }))

})


//ls_r(start, pull.leafFirst)
  //.pipe(pull.log())

