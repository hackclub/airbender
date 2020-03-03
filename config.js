module.exports = {
  airtable: {
    apiKey: process.env.AIRTABLE_KEY,
    bases: {
      operations: process.env.AIRTABLE_OPERATIONS_BASE,
      sdp: process.env.AIRTABLE_SDP_BASE,
      shipping: process.env.AIRTABLE_SHIPPING_BASE,
      hardwareDonations: process.env.AIRTABLE_HARDWARE_DONATIONS_BASE,
      formSubmissions: process.env.AIRTABLE_FORM_SUBMISSIONS_BASE,
      hackathons: process.env.AIRTABLE_HACKATHONS_BASE
    }
  },
  zapierWaitlistWebhook: process.env.ZAPIER_WAITLIST_WEBHOOK,
  shippoKey: process.env.SHIPPO_KEY,
  slackLegacyToken: process.env.SLACK_LEGACY_TOKEN
}
