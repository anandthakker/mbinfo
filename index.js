#!/usr/bin/env node

var Mbtiles = require('mbtiles')
var split = require('split')
var JSONStream = require('JSONStream')

/* eslint-disable no-new */
new Mbtiles(process.argv[2], function (err, mbtiles) {
  if (err) throw err

  if (process.argv[3] === 'size') {
    count(mbtiles._db)
  } else if (process.argv[3] === 'ls') {
    mbtiles.createZXYStream()
    .pipe(split(function (t) {
      t = t.split('/')
      t.push(t.shift())
      return t.join(' ') + '\n'
    }))
    .pipe(process.stdout)
  } else {
    mbtiles.getInfo(function (err, data) {
      if (err) throw err
      console.log(JSON.stringify(data))
    })
  }
})

function count (db) {
  var output = JSONStream.stringify()
  output.pipe(process.stdout)
  var query = 'SELECT COUNT(*) AS count, AVG(LENGTH(tile_data)) AS mean_size, MAX(LENGTH(tile_data)) AS max_size, SUM(LENGTH(tile_data)) AS total_size, zoom_level as z FROM tiles GROUP BY zoom_level'

  db.each(query, function (err, result) {
    result = result || {}
    if (err) throw err
    output.write(result)
  }, function () {
    output.end()
  })
}
