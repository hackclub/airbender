const Airtable = require('airtable')

const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.hackathons)

function airtableGeocodeToJSON(airtableGeocode) {
  const replaced = airtableGeocode.replace('🔵 ', '')
  return JSON.parse(Buffer.from(replaced, 'base64').toString())
}

module.exports = () => {
  return util.forEachInFilter(base, 'applications', [
    'FIND("🔵",{geocoded}) >= 1',
    '{lat} = BLANK()',
    '{lng} = BLANK()'
  ], hackathon => {
    const geocoded = hackathon.get('geocoded')
    const json = airtableGeocodeToJSON(geocoded)
    const { lat, lng } = json.o
    console.log('geocoding hackathon', hackathon.id)

    return hackathon.patchUpdate({
      'lat': lat.toString(),
      'lng': lng.toString()
    }).catch(err => console.error(err))
  })
}