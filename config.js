module.exports = {
  airtable: {
    apiKey: process.env.AIRTABLE_KEY,
    bases: {
      operations: process.env.AIRTABLE_OPERATIONS_BASE,
      shipping: process.env.AIRTABLE_SHIPPING_BASE,
      hardwareDonations: process.env.AIRTABLE_HARDWARE_DONATIONS_BASE,
      formSubmissions: process.env.AIRTABLE_FORM_SUBMISSIONS_BASE
    }
  },
  zapierWaitlistWebhook: process.env.ZAPIER_WAITLIST_WEBHOOK,
  shippoKey: process.env.SHIPPO_KEY
}
