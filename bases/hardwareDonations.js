const Airtable = require('airtable')

const config = require('../config.js')
const util = require('../util.js')

const base = new Airtable({apiKey: config.airtable.apiKey}).base(config.airtable.bases.hardwareDonations)

function generateBarcode() {
  return Math.floor(Math.random() * 10000000000).toString()
}

module.exports = () => {
  return util.forEachInTable(base, 'Products', product => {
    if (product.get('Generate Barcode') && !product.get('Barcode')) {
      const barcode = generateBarcode()

      return product.patchUpdate({
        'Barcode': {
          text: barcode,
        },
        'QR Code': [
          {
            url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + barcode
          }
        ]
      }).catch(err => console.error(err))
    }
  })
}