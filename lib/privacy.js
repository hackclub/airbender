const fetch = require('node-fetch')
const cryptojs = require('crypto-js')

module.exports = class Privacy {
  constructor(apiToken = process.env.PRIVACY_API_KEY, baseUrl = 'https://sandbox.privacy.com/v1') {
    this.apiToken = apiToken
    this.baseUrl = baseUrl
  }

  req(method, path, obj = {}, headers = {}) {
    let opts = {
      method: method,
      headers: {
        'Authorization': 'api-key ' + this.apiToken,
        'Content-Type': 'application/json'
      }
    }

    if (method != 'GET' && method != 'HEAD') {
      opts.body = JSON.stringify(obj)
    }

    return fetch(this.baseUrl + path, opts).then(resp => resp.json())
  }

  createCard(options = {}) {
    const body = {
      memo: options.memo,
      type: options.type,
      spend_limit: options.spend_limit || 0,
      spend_limit_duration: options.spend_limit_duration,
      state: options.state || 'PAUSED',
    }
    return this.req('POST', '/card', body)
  }

  getEmbed(options = {}) {
    const config = {
      token: options.token,
      css: options.css,
      expiration: options.expiration
    }

    const embedRequest = Buffer.from(JSON.stringify(config)).toString('base64')
    const hmac = cryptojs.HmacSHA256(JSON.stringify(config), this.apiToken).toString(cryptojs.enc.Base64)

    return `https://sandbox.privacy.com/v1/embed/card?embed_request=${embedRequest}&hmac=${hmac}`
  }

  updateCard(options = {}) {
    const body = {
      card_token: options.card_token,
      state: options.state,
      memo: options.memo,
      spend_limit: options.spend_limit,
      spend_limit_duration: options.spend_limit_duration
    }

    return this.req('PUT', '/card', body)
  }
}
