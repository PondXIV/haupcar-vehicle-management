const vehiclesModel = require('../models/vehiclesModel')

async function listVehicles(filters) {
  return vehiclesModel.findAll(filters)
}

module.exports = { listVehicles }
