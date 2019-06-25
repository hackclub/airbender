const Airtable = require('airtable')
const fetch = require('node-fetch')

const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.operations)

const sendConfirmationTo = email => (
  fetch(config.zapierWaitlistWebhook, {
    method: 'post',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' }
  })
)

module.exports = () => {
  const sentEmails = new Set([])

  return util.forEachInTable(base, 'Waitlist', applicant => {
    const email = applicant.get('Email')

    if (sentEmails.has(email)) {
      if (applicant.get('Send Confirmation')) {
        console.log(`Skipping duplicate waitlist entry for ${email} & noting in Airtable`)
        return applicant.patchUpdate({
          'Send Confirmation': false,
          'Notes': 'This is a duplicate waitlist entry– email confirmation not sent'
        })
      }
    } else {
      sentEmails.add(email)

      if (applicant.get('Send Confirmation')) {
        console.log(`Sending waitlist confirmation to ${email}...`)
        return sendConfirmationTo(email).then(_ => {
          console.log(`Sent confirmation to ${email}`)
          return applicant.patchUpdate({
            'Send Confirmation': false,
            'Notes': 'Email confirmation sent by Zapier'
          })
        }).catch(e => {
          console.log(e.message)
          return applicant.patchUpdate({
            'Send Confirmation': false,
            'Notes': `Automatic sending failed with error: ${e.message}`
          })
        })
      }
    }
  })
}