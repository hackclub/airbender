require('dotenv').config()

const shipping = require('./bases/shipping.js')
const hardwareDonations = require('./bases/hardwareDonations.js')
const formSubmissions = require('./bases/formSubmissions.js')

// Entrypoint of application in ES6
console.log(`Airbender iteration starting...`)

Promise.all([
  shipping(),
  hardwareDonations(),
  formSubmissions()
]).catch(err => console.error(err))
