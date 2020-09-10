const Airtable = require('airtable')

const slack = require('../lib/slack.js')
const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.sdp)
const opsBase = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)

function lookupSlackByGithub(username) {
  return new Promise((resolve, reject) => {
    if (!username) {
      resolve(null)
    }

    opsBase('People').select({
      maxRecords: 1,
      filterByFormula: `{GitHub URL} = 'https://github.com/${username}'`
    }).firstPage((err, records) => {
      if (err) reject(err)
      if (records && records[0]) {
        const slackID = records[0].get('Slack ID')
        resolve(slackID)
      }
      resolve(null)
    })
  })
}

function findDupes(githubUsername) {
  return new Promise((resolve, reject) => {
    base('SDP Priority Activations').select({
      maxRecords: 1,
      filterByFormula: `AND(NOT({Mail Mission}=BLANK()),{GitHub Username}="${githubUsername}")`
    }).firstPage((err, records) => {
      if (err) reject(err)
      if (records && records[0]) {
        resolve(records[0])
      }
      resolve(null)
    })
  })
}

function lookupSlackByEmail(email) {
  return new Promise((resolve, reject) => {
    if (!email) {
      resolve(null)
    }

    opsBase('People').select({
      maxRecords: 1,
      filterByFormula: `{Email} = '${email}'`
    }).firstPage((err, records) => {
      if (err) reject(err)
      if (records && records[0]) {
        const slackID = records[0].get('Slack ID')
        resolve(slackID)
      }
      resolve(null)
    })
  })
}

function findMissionBySDP(id) {
  console.log('Finding mission with SDP record', id)
  return new Promise((resolve, reject) => {
    opsBase('Mail Missions').select({
      maxRecords: 1,
      filterByFormula: `FIND("${id}", Notes) >= 1`
    }).firstPage((err, records) => {
      if (err) reject(err)
      if (records && records[0]) {
        const mission = records[0].get('Mission Thread Link')
        resolve(mission)
      }
      resolve(null)
    })
  })
}

async function processActivations() {
  const formula = 'AND({Create mail mission}, {Mail Mission} = BLANK())'
  util.findInTable(base, 'SDP Priority Activations', formula, async sdp => {

    if (await findDupes(sdp.get('GitHub Username'))) {
      await sdp.patchUpdate({ 'Create mail mission': false, 'Mail Mission': 'Skipping: user already has mail mission' })
      return
    }
    let recipient = sdp.get('GitHub Email')
    const recipientSlack = await lookupSlackByGithub(sdp.get('GitHub Username')) || await lookupSlackByEmail('GitHub Email')
    if (recipientSlack) {
      recipient = `<@${recipientSlack}>`
    }

    if (recipient) {
      const message = await slack.chat.postMessage({
        text: `<@UNRAW3K7F> send hack_pack_envelope ${recipient} airbender ID ${sdp.id}`,
        channel: 'GNTFDNEF8',
        as_user: true
      })

      await sdp.patchUpdate({ 'Create mail mission': false, 'Mail Mission': 'Awaiting Postmaster...' })
    } else {
      await sdp.patchUpdate({ 'Create mail mission': false, 'Mail Mission': 'Failed to find recipient contact info...' })
    }
  })
}

async function processMissions() {
  const formula = "{Mail Mission} = 'Awaiting Postmaster...'"
  util.findInTable(base, 'SDP Priority Activations', formula, async sdp => {
    const mission = await findMissionBySDP(sdp.id)
    if (mission) {
      await sdp.patchUpdate({ 'Mail Mission': mission })
    }
  })
}

module.exports = () => (
  Promise.all([
    processActivations(),
    processMissions(),
  ])
)
