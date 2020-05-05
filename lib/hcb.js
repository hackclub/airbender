const fetch = require('node-fetch')

module.exports = class HCB {
  constructor(apiToken = process.env.HCB_API_KEY, baseUrl = 'https://bank.hackclub.com/api/v1') {
    this.apiToken = apiToken
    this.baseUrl = baseUrl
  }

  req(method, path, obj = {}, headers = {}) {
    headers['Authorization'] = `Bearer ${this.apiToken}`

    let opts = {
      method: method,
      headers: headers,
      body: JSON.stringify(obj)
    }

    return fetch(this.baseUrl + path, opts).then(resp => resp.json())
  }

  createProject(options = {}) {
    return this.req('POST', '/events', options)
  }
}