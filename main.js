const shippingBase = require('./shippingBase.js')

// Entrypoint of application in ES6
console.log(`Airbender iteration starting...`)

Promise.all([
  shippingBase()
]).catch(err => console.error(err))
