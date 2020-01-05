const Airtable = require('airtable')

const config = require('../config.js')
const { forEachInTable } = require('../util.js')
const Privacy = require('../lib/privacy')

async function processClubsWithoutCards() {
  const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)
  return forEachInTable(base, 'Clubs', club => {
    if (club.get('Should have Privacy Card') && !club.get('Privacy Card')) {

    }
  })
}

module.exports = () => (
  Promise.all([
    processClubsWithoutCards(),
    processCards()
  ])
)