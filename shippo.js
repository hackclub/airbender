const fetch = require('node-fetch')

module.exports = class Shippo {
  constructor(apiToken, baseUrl = 'https://api.goshippo.com') {
    this.apiToken = apiToken
    this.baseUrl = baseUrl
  }

  req(method, path, obj = {}, headers = {}) {
    let opts = {
      method: method,
      headers: {
        'Authorization': 'ShippoToken ' + this.apiToken,
        'Content-Type': 'application/json'
      }
    }

    if (method != 'GET' && method != 'HEAD') {
      opts.body = JSON.stringify(obj)
    }

    return fetch(this.baseUrl + path, opts)
      .then(resp => resp.json())
  }

  createOrder(toAddress, fromAddress, weight = 0, weightUnit = 'lb', placedAt = new Date()) {
    const body = {
      to_address: toAddress,
      from_address: fromAddress,
      weight: weight,
      weight_unit: weightUnit,
      placed_at: placedAt
    }

    return this.req('POST', '/orders', body)
  }

  getOrder(orderId) {
    return this.req('GET', '/orders/' + orderId)
  }

  createAddress(addressObj) {
    return this.req('POST', '/addresses', addressObj)
  }
}
