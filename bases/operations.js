const Airtable = require('airtable')
const fetch = require('node-fetch')

const config = require('../config.js')
const util = require('../util.js')
const Privacy = require('../lib/privacy')
const geocoder = require('../lib/geocode')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)
const privacy = new Privacy

async function processClubs() {
  util.forEachInTable(base, 'Clubs', async club => {
    if (club.get('Privacy Card Limit') > 0 && !club.get('Privacy Card')) {
      console.log('Creating card for club', club.id)
      try {
      const card = await privacy.createCard({
        type: 'UNLOCKED',
        spend_limit: 0,
        spend_limit_duration: 'FOREVER',
        state: 'OPEN',
      })
      const cardRecord = await base('Privacy Cards').create({
        'Privacy Token': card.token,
        'Club': [club.id],
        'State': card.state,
        'Sync with Privacy': true,
      })
      console.log('Created card', JSON.stringify(card))
      } catch (err) {
        console.error(err)
      }
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
        spend_limit: card.get('Spending limit') * 100, // privacy accepts this in cents
      })
      console.log('Updated card values:', privacyResponse)
      await card.patchUpdate({ 'Sync with Privacy': false })
    }
    if (card.get('Privacy Token') && !card.get('Embed URL')) {
      await card.patchUpdate({
        'Embed URL': privacy.getEmbed({
          token: card.get('Privacy Token'),
          css: 'https://hackclub.github.io/privacy-card-embed/style.css'
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

async function processAddresses() {
  // Open street map has a rate-limit of 1 req/sec that they *DO* enforce
  base('Addresses').select({
    maxRecords: 1,
    filterByFormula: '{Attempted to Geocode} = 0'
  }).firstPage(async (err, records) => {
    if (err) throw err
    const address = records[0]
    if (address) {
      try {
        const results = await geocoder.geocode({
          postalcode: address.get('Postal Code'),
          state: address.get('State/Province'),
          city: address.get('City'),
          street: [
            address.get('Street (First Line)'),
            address.get('Street (Second Line)'),
            address.get('Street (Third Line)')
          ].join(' ')
        })
        const formattedAddress = results[0] || {}

        await address.patchUpdate({
          'Attempted to Geocode': true,
          'Latitude': String(formattedAddress.latitude || ''),
          'Longitude': String(formattedAddress.longitude || '')
        })

      } catch(err) {
        console.log(err)
      }
    }
  })
}

module.exports = () => (
  Promise.all([
    processClubs(),
    processCards(),
    processGrantRequests(),
    processAddresses(),
  ])
)
