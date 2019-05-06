// The table we track submissions in can be found here: https://airtable.com/tblmzNkrQ4v5zEZus/viwIJwBpxkc9HpCPv?blocks=hide
// The Zap that submits to Airtable can be found here: https://zapier.com/app/editor/56889892/overview

const Airtable = require('airtable')

const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.formSubmissions)

module.exports = () => {
  return util.forEachInTable(base, 'Submissions', submission => {
    if (submission.get('Populate Fields') && !submission.get('Generated Record')) {
      try {
        const body = JSON.parse(submission.get('Body'))
        const bodyTable = body.table
        const bodyBase = body.base
        const bodyRecord = body.record

        const destination = new Airtable({apiKey: config.airtable.apiKey}).base(bodyBase)
        destination.table(bodyTable).create(bodyRecord, function(err, result) {
          if (err) {
            return submission.patchUpdate({
              'Populate Fields': null,
              'Status': err.message
            })
          }
          submission.patchUpdate({
            'Table': bodyTable,
            'Base': bodyBase,
            'Populate Fields': null,
            'Status': 'Success'
          })
       })
      } catch (e) {
        return submission.patchUpdate({
          'Populate Fields': null,
          'Status': e.message
        })
      }
    }
  })
}