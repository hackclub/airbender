const fetch = require('node-fetch')

module.exports = class Privacy {
  constructor(apiToken = process.env.PRIVACY_API_KEY, baseUrl = 'https://sandbox.privacy.com/v1') {
    this.apiToken = apiToken
    this.baseUrl = baseUrl
  }

  req(method, path, obj = {}, headers = {}) {
    let opts = {
      method: method,
      headers: {
        'Authorization': 'api-token ' + this.apiToken,
        'Content-Type': 'application/json'
      }
    }

    if (method != 'GET' && method != 'HEAD') {
      opts.body = JSON.stringify(obj)
    }

    return fetch(this.baseUrl + path, opts).then(resp => resp.json())
  }

  createCard(options) {
    const body = {
      memo: options.memo,
      type: options.type,
      spend_limit: options.spend_limit || 0,
      spend_limit_duration: options.spend_limit_duration,
      state: options.state || 'PAUSED',
    }
    return this.req('POST', '/card', body)
  }
}