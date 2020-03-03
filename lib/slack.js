const { WebClient } = require('@slack/web-api')

const config = require('../config')
const slack = new WebClient(config.slackLegacyToken)

module.exports = slack