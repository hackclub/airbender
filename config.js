module.exports = {
  airtable: {
    apiKey: process.env.AIRTABLE_KEY,
    bases: {
      shipping: process.env.AIRTABLE_SHIPPING_BASE,
      hardwareDonations: process.env.AIRTABLE_HARDWARE_DONATIONS_BASE,
      formSubmissions: process.env.AIRTABLE_FORM_SUBMISSIONS_BASE
    }
  },
  shippoKey: process.env.SHIPPO_KEY
}
