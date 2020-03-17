const Client = require("@googlemaps/google-maps-services-js").Client

const config = require('../config')
const client = new Client({})

const geocode = async address => {
  const request = await client.geocode({ params: {
    address,
    key: config.googleApiKey
  }})
  if (request.data.status == 'OK') {
    return request.data.results[0]
  }
  if (request.data.status == 'ZERO_RESULTS') {
    return null
  }

  throw request.data.status
}

module.exports = geocode