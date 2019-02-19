module.exports = {
  airtable: {
    apiKey: process.env.AIRTABLE_KEY,
    bases: {
      shipping: process.env.AIRTABLE_SHIPPING_BASE
    }
  },
  shippoKey: process.env.SHIPPO_KEY
}
