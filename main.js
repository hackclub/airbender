require('dotenv').config()

const operations = require('./bases/operations.js')
const shipping = require('./bases/shipping.js')
const sdp = require('./bases/sdp.js')
const hardwareDonations = require('./bases/hardwareDonations.js')
const formSubmissions = require('./bases/formSubmissions.js')
const hackathons = require('./bases/hackathons.js')

// Entrypoint of application in ES6
console.log(`Airbender iteration starting...`)

Promise.all([
  operations(),
  shipping(),
  hardwareDonations(),
  formSubmissions(),
  hackathons(),
  sdp()
]).catch(err => console.error(err))
