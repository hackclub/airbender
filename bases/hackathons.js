const Airtable = require('airtable')

const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.hackathons)

function airtableGeocodeToJSON(airtableGeocode) {
  let replaced = airtableGeocode.replace('🔵 ', '').replace('🔴 ', '')
  return JSON.parse(Buffer.from(replaced, 'base64').toString())
}

module.exports = () => {
  return util.forEachInTable(base, 'applications', hackathon => {
    if (hackathon.get('geocoded')) {
      let geocoded = hackathon.get('geocoded')
      let json = airtableGeocodeToJSON(geocoded)

      return hackathon.patchUpdate({
        'lat': (json.o.lat === undefined ? '' : json.o.lat.toString()),
        'lng': (json.o.lng === undefined ? '' : json.o.lng.toString())
      }).catch(err => console.error(err))
    }
  })
}