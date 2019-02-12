require('dotenv').config()

const Airtable = require('airtable')
const Shippo = require('./shippo.js')
const md5 = require('md5')

const AIRTABLE_KEY = process.env.AIRTABLE_KEY
const AIRTABLE_BASE = process.env.AIRTABLE_BASE

const SHIPPO_KEY = process.env.SHIPPO_KEY

const base = new Airtable({apiKey: AIRTABLE_KEY}).base(AIRTABLE_BASE)
const shippo = new Shippo(SHIPPO_KEY)

function forEachInTable(tableName, cb) {
  return base(tableName)
    .select()
    .eachPage((records, fetchNextPage) => {
      records.forEach(record => {
        cb(record)
      })

      fetchNextPage()
    })
}

forEachInTable('Shippo Orders', order => {
  if (order.get('Create Order') && !order.get('Shippo Order ID')) {
    const shipmentId = order.get('Shipment')[0]

    base('Shipments').find(shipmentId)
      .then(shipment => {
        const recipientId = shipment.get('Recipient')[0]
        const senderId = shipment.get('Sender')[0]

        return base('Recipients').find(recipientId).then(recipient => {
          return base('Senders').find(senderId).then(sender => {
            return shippo.createOrder(
              recipient.get('Shippo Address ID'),
              sender.get('Shippo Address ID')
            )
              .then(sOrder => {
                return order.patchUpdate({
                  'Shippo Order ID': sOrder.object_id
                })
              })
              .then(() => {
                console.log('Success creating order for', shipment.id)
              })
          })
        })
      })
  }

  if (order.get('Shippo Order ID') && !order.get('Shipping Label')) {
    shippo.getOrder(order.get('Shippo Order ID')).then(sOrder => {
      if (sOrder.order_status == 'SHIPPED') {
        order.patchUpdate({
          'Shipping Label': [
            {
              url: sOrder.transactions[0].label_url
            }
          ],
          'Shipping Label URL': sOrder.transactions[0].label_url
        })
          .then(() => console.log('Added shipping label to', order.id))
      }
    }).catch(err => console.error(err))
  }
})

function hash(obj) {
  return md5(JSON.stringify(obj))
}

function handleAddress(obj) {
  const country = obj.get('Country')
  const countryParts = country.split(' ')
  const countryCode = countryParts[countryParts.length - 1]
    .replace('(', '')
    .replace(')', '')

  const address = {
    name: obj.get('Name'),
    company: obj.get('Company'),
    street1: obj.get('Street (line 1)'),
    street2: obj.get('Street (line 2)'),
    city: obj.get('City'),
    zip: obj.get('ZIP Code'),
    state: obj.get('State'),
    country: countryCode,
    phone: obj.get('Phone Number'),
    email: obj.get('Email'),
    is_residential: obj.get('Is Residential'),
    validate: true
  }

  if (obj.get('Address Hash') == hash(address)) {
    return
  }

  shippo.createAddress(address)
    .then(shippoAddress => {
      return obj.patchUpdate({
        'Shippo Address ID': shippoAddress.object_id,
        'Address Hash': hash(address)
      })
    })
}

forEachInTable('Senders', sender => {
  return handleAddress(sender)
})

forEachInTable('Recipients', recipient => {
  return handleAddress(recipient)
})
