const Airtable = require('airtable')

const slack = require('../lib/slack.js')
const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.gch)
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
  util.findInTable(base, 'Sticker Requests', formula, async gch => {
    const recipient = `max+gch-stickers-${gch.id}@hackclub.com`
    let text = `<@UNRAW3K7F> send gch_stickers ${recipient} airbender ID ${gch.id}`
    if (gch.fields['Comment']) {
      text = `${text} | ${gch.fields['Comment']}`
    }
    const message = await slack.chat.postMessage({
      text: text,
      channel: 'GNTFDNEF8',
      as_user: true
    })
    await gch.patchUpdate({ 'Create mail mission': false, 'Mail Mission': 'Awaiting Postmaster...' })
  })
}

async function processMissions() {
  const formula = "{Mail Mission} = 'Awaiting Postmaster...'"
  util.findInTable(base, 'Sticker Requests', formula, async gch => {
    const mission = await findMissionByRequest(gch.id)
    if (mission) {
      await gch.patchUpdate({ 'Mail Mission': mission })
    }
  })
}

module.exports = async () => (
  await Promise.all([
    processRequests(),
    processMissions(),
  ])
)