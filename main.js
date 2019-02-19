require('dotenv').config()

const shipping = require('./bases/shipping.js')
const hardwareDonations = require('./bases/hardwareDonations.js')

// Entrypoint of application in ES6
console.log(`Airbender iteration starting...`)

Promise.all([
  shipping(),
  hardwareDonations()
]).catch(err => console.error(err))
