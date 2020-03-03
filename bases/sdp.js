const Airtable = require('airtable')

const slack = require('../lib/slack.js')
const config = require('../config.js')
const util = require('../util.js')

function lookupSlackByGithub(username) {
  return new Promise((resolve, reject) => {
    if (!username) {
      resolve(null)
    }

    const opsBase = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)
    opsBase('People').select({
      maxRecords: 1,
      filterByFormula: `{GitHub URL} = 'https://github.com/${username}'`
    }).firstPage((err, records) => {
      if (err) reject(err)
      if (records && records[0]) {
        const slackID = records[0].get('Slack ID')
        console.log('Found Slack ID for GitHub account', username, slackID)
        resolve(slackID)
      }
      resolve(null)
    })
  })
}

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.sdp)
async function processActivations() {
  util.forEachInTable(base, 'SDP Priority Activations', async sdp => {
    if (sdp.get('Create mail mission') && !sdp.get('Mail Mission')) {
      // this SDP should have a mail mission created

      let recipient = sdp.get('GitHub Email')
      const recipientSlack = await lookupSlackByGithub(sdp.get('GitHub Username'))
      if (recipientSlack) {
        recipient = `<@${recipientSlack}>`
      }

      const message = await slack.chat.postMessage({
        text: `<@UNRAW3K7F> send hack_pack_envelope ${recipient} airbender ID ${sdp.id}`,
        channel: 'GNTFDNEF8',
        as_user: true
      })

      await sdp.patchUpdate({ 'Create mail mission': false, 'Mail Mission': 'Awaiting Postmaster...' })
      console.log('patched')
    }
  })
}

module.exports = () => (
  Promise.all([
    processActivations(),
  ])
)
