const NodeGeocoder = require('node-geocoder')
const config = require('../config')
const options = {
  provider: 'google',
  'user-agent': 'hackclub-airbenderBot',
  apiKey: config.googleApiKey,
}

const geocoder = NodeGeocoder(options)
module.exports = geocoder