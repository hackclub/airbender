const Airtable = require('airtable')
const fetch = require('node-fetch')

const config = require('../config.js')
const util = require('../util.js')
const Privacy = require('../lib/privacy')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)
const privacy = new Privacy

async function processClubs() {
  util.forEachInTable(base, 'Clubs', async club => {
    if (club.get('Should have Privacy Card') && !club.get('Privacy Card')) {
      console.log('Creating card for club', club.id)
      const card = await privacy.createCard({
        type: 'UNLOCKED',
        spend_limit: 0,
        spend_limit_duration: 'FOREVER',
        state: 'OPEN',
      })
      const cardRecord = await base('Privacy Cards').create({
        'Privacy Token': card.token,
        'Club': [club.id],
        'Spending limit (cents)': card.spend_limit,
        'State': card.state,
        'Sync with Privacy': true,
      })
      console.log('Created card', JSON.stringify(card))
    }
  })
}

async function processCards() {
  util.forEachInTable(base, 'Privacy Cards', async card => {
    if (card.get('Sync with Privacy')) {
      console.log('Updating Privacy with changes from ', card.get('ID'))
      const privacyResponse = await privacy.updateCard({
        card_token: card.get('Privacy Token'),
        state: card.get('State'),
        memo: card.get('Memo'),
        spend_limit: card.get('Spending limit (cents)'),
      })
      console.log('Updated card values:', privacyResponse)
      await card.patchUpdate({ 'Sync with Privacy': false })
    }
    if (card.get('Privacy Token') && !card.get('Embed URL')) {
      await card.patchUpdate({
        'Embed URL': privacy.getEmbed({
          token: card.get('Privacy Token'),
          css: 'https://infantileblissfulrectangles.maxwofford.repl.co/style.css'
        })
      })
    }
  })
}

async function processGrantRequests() {
  util.forEachInTable(base, 'Grant Requests', async grantRequest => {
    if (grantRequest.get('Grant Record ID') && !grantRequest.get('GitHub Grant')) {
      console.log('Found unassociated grant', grantRequest.id, '...')
      const grant = await base('GitHub Grants').find(grantRequest.get('Grant Record ID'))
      console.log('Tying to grant', grant.id)
      await grantRequest.patchUpdate({ "GitHub Grant": [grant.id] })
    }
  })
}

module.exports = () => (
  Promise.all([
    processClubs(),
    processCards(),
    processGrantRequests(),
  ])
)