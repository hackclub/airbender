const Airtable = require('airtable')
const fetch = require('node-fetch')

const slack = require('../lib/slack.js')
const config = require('../config.js')
const util = require('../util.js')
const Privacy = require('../lib/privacy')
const geocode = require('../lib/geocode')

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

function airtableGeocodeToJSON(airtableGeocode) {
  const replaced = airtableGeocode.replace('🔵 ', '')
  return JSON.parse(Buffer.from(replaced, 'base64').toString())
}

async function processAddresses() {
  return Promise.all([
    // Open street map has a rate-limit of 1 req/sec that they *DO* enforce
    util.findInTable(base, 'Addresses', '{Attempted to Geocode} = 0', async address => {
      try {
        const result = await geocode(address.fields['Formatted Address'])
        const location = ((result || {}).geometry || {}).location || {}

        await address.patchUpdate({
          'Attempted to Geocode': true,
          'Latitude': String(location.latitude || ''),
          'Longitude': String(location.longitude || '')
        })

      } catch(err) {
        console.log(err)
      }
    }),
    util.forEachInFilter(base, 'addresses', [
      'FIND("🔵",{Geocode}) >= 1',
      'Latitude = BLANK()',
      'Longitude = BLANK()'
    ], async address => {
      let geocoded = address.get('Geocode')
      console.log('geocoding', address.get('ID'))
      let json = airtableGeocodeToJSON(geocoded)

      let {lat, lng} = json.o
      console.log('lat long', lat, lng)
      if (lat && lng) {
        await address.patchUpdate({
          'Latitude': lat.toString(),
          'Longitude': lng.toString(),
          'Attempted to Geocode': true,
        })
      }
    })
  ])
}

async function processMailMissions() {
  const formula = 'AND({Paid GP} = 0, {Status} = "6 Delivered", {Test} = 0)'
  // this is rate-limited using findInTable because postmaster *will break* if you send too many missions at once
  util.findInTable(base, 'Mail Missions', formula, async mission => {
    const message = slack.chat.postMessage({
      text: `<@UH50T81A6> give ${mission.fields['Sender Message Tag']} ${mission.fields['GP Value']}gp for shipping a package`,
      channel: 'GNTFDNEF8',
      thread_ts: mission.fields['Mail Team Thread Timestamp'],
      as_user: true
    })
    await mission.patchUpdate({ 'Paid GP': true })
  })
}

module.exports = () => (
  Promise.all([
    // processClubs(),
    // processCards(),
    // processGrantRequests(),
    processAddresses(),
    // processMailMissions(),
  ])
)
