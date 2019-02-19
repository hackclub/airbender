const md5 = require('md5')

// to iterate through airtable tables
function forEachInTable(base, tableName, cb) {
  return base(tableName)
    .select()
    .eachPage((records, fetchNextPage) => {
      records.forEach(record => {
        cb(record)
      })

      fetchNextPage()
    })
}

function hash(obj) {
  return md5(JSON.stringify(obj))
}

module.exports = {
  forEachInTable: forEachInTable,
  hash: hash
}
