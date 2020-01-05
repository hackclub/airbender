const Airtable = require('airtable')
const fetch = require('node-fetch')

const config = require('../config.js')
const util = require('../util.js')
const Privacy = require('../lib/privacy')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)
const privacy = new Privacy

async function processClubs() {
  util.forEachInTable(base, 'Clubs', async club => {
    if (club.get('Should have Privacy Card' && !club.get('Privacy Card'))) {
      console.log('Creating card for club', club.id)
      const card = await privacy.createCard()
      const cardRecord = await base('Privacy Cards').create({
        'Privacy Token': card.token,
        'Club': [club.id],
        'Spending limit (cents)': 0,
      })
    }
  })
}

module.exports = () => (
  Promise.all([
    processClubs(),
  ])
)