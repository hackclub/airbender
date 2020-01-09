const NodeGeocoder = require('node-geocoder')
const options = {
  provider: 'openstreetmap',
  'user-agent': 'hackclub-airbenderBot'
}

const geocoder = NodeGeocoder(options)
module.exports = geocoder