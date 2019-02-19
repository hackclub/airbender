const shipping = require('./bases/shipping.js')

// Entrypoint of application in ES6
console.log(`Airbender iteration starting...`)

Promise.all([
  shipping()
]).catch(err => console.error(err))
