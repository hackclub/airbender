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

// more performative forEachInTable
function forEachInFilter(base, tableName, formula, cb) {
  const selectOptions = {
    filterByFormula: formula
  }
  if (Array.isArray(formula)) {
    selectOptions.filterByFormula = `AND(${formula.join(',')})`
  }
  return base(tableName)
    .select(selectOptions)
    .eachPage(async (records, fetchNextPage) => {
      records.forEach(cb)
      fetchNextPage()
    })
}

// to iterate through airtable tables once per airbender cycle.
// for tables with race conditions or rate-limiting
// ex. the SDP airtable takes about 10 seconds to load all the records at once
function findInTable(base, tableName, formula, cb) {
  return base(tableName)
    .select({
      maxRecords: 1,
      filterByFormula: formula
    })
    .firstPage((err, records) => {
      if (records[0]) {
        cb(records[0])
      }
    })
}

async function stopwatch(name, func) {
  const start = Date.now()
  const result = await func()
  const duration = Date.now() - start
  console.log( '...', name, 'took', duration, 'ms')
  return result
}

function hash(obj) {
  return md5(JSON.stringify(obj))
}

module.exports = {
  forEachInTable: forEachInTable,
  forEachInFilter: forEachInFilter,
  findInTable: findInTable,
  stopwatch: stopwatch,
  hash: hash
}
