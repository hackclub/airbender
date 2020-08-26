const Airtable = require('airtable')

const slack = require('../lib/slack.js')
const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.som)
const opsBase = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)

function findMissionByRequest(id) {
  return new Promise((resolve, reject) => {
    opsBase('Mail Missions').select({
      maxRecords: 1,
      filterByFormula: `FIND("${id}", Notes) >= 1`
    }).firstPage((err, records) => {
      if (err) reject(err)
      if (records && records[0]) {
        const mission = records[0].get('Mission Thread Link')
        resolve(mission)
      }
      resolve(null)
    })
  })
}

async function processRequests() {
  const formula = 'AND({Create mail mission}, {Mail Mission} = BLANK())'
  util.findInTable(base, 'Sticker Requests', formula, async som => {
    const recipient = `max+som-stickers-${som.id}@hackclub.com`
    const message = await slack.chat.postMessage({
      text: `<@UNRAW3K7F> send som_stickers ${recipient} airbender ID ${som.id} | ${som.fields['Comment']}`,
      channel: 'GNTFDNEF8',
      as_user: true
    })
    await som.patchUpdate({ 'Create mail mission': false, 'Mail Mission': 'Awaiting Postmaster...' })
  })
}

async function processMissions() {
  const formula = "{Mail Mission} = 'Awaiting Postmaster...'"
  util.findInTable(base, 'Sticker Requests', formula, async som => {
    const mission = await findMissionByRequest(som.id)
    if (mission) {
      await som.patchUpdate({ 'Mail Mission': mission })
    }
  })
}

module.exports = async () => (
  await Promise.all([
    processRequests(),
    processMissions(),
  ])
)