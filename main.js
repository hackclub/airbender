require('dotenv').config()

const stopwatch = require('./util.js').stopwatch
const operations = require('./bases/operations.js')
const shipping = require('./bases/shipping.js')
const sdp = require('./bases/sdp.js')
const hardwareDonations = require('./bases/hardwareDonations.js')
const formSubmissions = require('./bases/formSubmissions.js')
const hackathons = require('./bases/hackathons.js')
const bankApplications = require('./bases/bankApplications.js')
const som = require('./bases/som.js')

// Entrypoint of application in ES6
console.log(`Airbender iteration starting...`)

Promise.all([
  stopwatch('operations', operations),
  stopwatch('shipping', shipping),
  stopwatch('hardwareDonations', hardwareDonations),
  stopwatch('formSubmissions', formSubmissions),
  stopwatch('hackathons', hackathons),
  stopwatch('sdp', sdp),
  stopwatch('som', som),
  stopwatch('bankApplications', bankApplications)
]).catch(err => console.error(err))
