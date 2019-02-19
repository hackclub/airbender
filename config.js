module.exports = {
  airtable: {
    apiKey: process.env.AIRTABLE_KEY,
    bases: {
      shipping: process.env.AIRTABLE_SHIPPING_BASE,
      hardwareDonations: process.env.AIRTABLE_HARDWARE_DONATIONS_BASE
    }
  },
  shippoKey: process.env.SHIPPO_KEY
}
