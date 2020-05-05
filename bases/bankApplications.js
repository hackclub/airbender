const Airtable = require('airtable')

const HCB = require('../lib/hcb.js')
const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.bankApply)
const hcb = new HCB()

async function processAccountCreations() {
  const formula = 'AND({HCB account URL}=BLANK(),{Should generate HCB account?}=1)'
  util.forEachInFilter(base, 'Events', formula, async eventRecord => {
    await eventRecord.patchUpdate({ 'HCB account URL': 'Awaiting response from bank...' })
    
    const hcbResponse = await hcb.createProject({
      name: eventRecord.fields['Event Name'],
      'organizer_emails': [eventRecord.fields['Email Address']]
    })

    if (hcbResponse.error) {
      console.log('Failed to create HCB project')

      await eventRecord.patchUpdate({
        'HCB account URL': `Got error from HCB: "${hcbResponse.error}"`
      })
    } else {
      console.log('Created HCB project', hcbResponse.event.slug)

      await eventRecord.patchUpdate({
        'HCB account URL': hcbResponse.event_url
      })
    }
  })
}

module.exports = () => (
  Promise.all([
    processAccountCreations(),
  ])
)